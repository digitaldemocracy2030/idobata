from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union
import os
import chromadb
import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Idobata Embedding Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

CHROMA_DB_PATH = "/data/chroma"
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = chroma_client.get_or_create_collection(
    name="problems_solutions",
    metadata={"hnsw:space": "cosine"}  # Use cosine similarity
)

class Item(BaseModel):
    id: str
    text: str
    topicId: str
    questionId: Optional[str] = None
    itemType: str  # "problem" or "solution"

class EmbeddingRequest(BaseModel):
    items: List[Item]

class EmbeddingResponse(BaseModel):
    status: str
    generatedCount: int
    errors: List[str] = []

class SearchFilter(BaseModel):
    topicId: str
    questionId: Optional[str] = None
    itemType: str  # "problem" or "solution"

class SearchRequest(BaseModel):
    queryVector: List[float]
    filter: SearchFilter
    k: int = 5

class SearchResult(BaseModel):
    id: str
    similarity: float

class SearchResponse(BaseModel):
    results: List[SearchResult]

class ClusteringFilter(BaseModel):
    topicId: str
    questionId: Optional[str] = None
    itemType: str  # "problem" or "solution"

class ClusteringRequest(BaseModel):
    filter: ClusteringFilter
    method: str  # "kmeans" or "hierarchical"
    params: Dict[str, Any]

class ClusterItem(BaseModel):
    id: str
    cluster: int

class ClusteringResponse(BaseModel):
    clusters: List[ClusterItem]

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    try:
        response = client.embeddings.create(
            input=texts,
            model="text-embedding-004"
        )
        return [embedding.embedding for embedding in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Idobata Embedding Service API"}

@app.post("/api/embeddings/generate", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    if not request.items:
        return EmbeddingResponse(status="success", generatedCount=0)
    
    texts = [item.text for item in request.items]
    ids = [item.id for item in request.items]
    
    try:
        embeddings = await generate_embeddings(texts)
        
        metadatas = [
            {
                "topicId": item.topicId,
                "questionId": item.questionId if item.questionId else "",
                "itemType": item.itemType
            }
            for item in request.items
        ]
        
        collection.upsert(
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        return EmbeddingResponse(
            status="success",
            generatedCount=len(embeddings)
        )
    
    except Exception as e:
        return EmbeddingResponse(
            status="error",
            generatedCount=0,
            errors=[str(e)]
        )

@app.post("/api/vectors/search", response_model=SearchResponse)
async def search_vectors(request: SearchRequest):
    where_filter = {"$and": [{"topicId": request.filter.topicId}]}
    
    if request.filter.questionId:
        where_filter["$and"].append({"questionId": request.filter.questionId})
    
    where_filter["$and"].append({"itemType": request.filter.itemType})
    
    results = collection.query(
        query_embeddings=[request.queryVector],
        n_results=request.k,
        where=where_filter
    )
    
    search_results = []
    for i in range(len(results["ids"][0])):
        search_results.append(
            SearchResult(
                id=results["ids"][0][i],
                similarity=float(results["distances"][0][i])
            )
        )
    
    return SearchResponse(results=search_results)

@app.post("/api/vectors/cluster", response_model=ClusteringResponse)
async def cluster_vectors(request: ClusteringRequest):
    where_filter = {"$and": [{"topicId": request.filter.topicId}]}
    
    if request.filter.questionId:
        where_filter["$and"].append({"questionId": request.filter.questionId})
    
    where_filter["$and"].append({"itemType": request.filter.itemType})
    
    dummy_vector = [0.0] * 768  # Standard dimension for text-embedding-004
    results = collection.query(
        query_embeddings=[dummy_vector],
        where=where_filter,
        include=["embeddings", "metadatas"],
        n_results=1000  # Set a high number to get all results
    )
    
    if not results["ids"]:
        return ClusteringResponse(clusters=[])
    
    embeddings_array = np.array(results["embeddings"])
    
    if request.method == "kmeans":
        n_clusters = request.params.get("n_clusters", 3)
        model = KMeans(n_clusters=n_clusters)
        labels = model.fit_predict(embeddings_array)
    
    elif request.method == "hierarchical":
        n_clusters = request.params.get("n_clusters")
        distance_threshold = request.params.get("distance_threshold")
        linkage = request.params.get("linkage", "ward")
        
        if n_clusters:
            model = AgglomerativeClustering(
                n_clusters=n_clusters,
                linkage=linkage
            )
        elif distance_threshold:
            model = AgglomerativeClustering(
                distance_threshold=distance_threshold,
                n_clusters=None,
                linkage=linkage
            )
        else:
            model = AgglomerativeClustering(n_clusters=3, linkage=linkage)
        
        labels = model.fit_predict(embeddings_array)
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported clustering method: {request.method}")
    
    clusters = []
    for i, label in enumerate(labels):
        clusters.append(
            ClusterItem(
                id=results["ids"][i],
                cluster=int(label)
            )
        )
    
    return ClusteringResponse(clusters=clusters)

class TransientEmbeddingRequest(BaseModel):
    text: str

class TransientEmbeddingResponse(BaseModel):
    embedding: List[float]

@app.post("/api/embeddings/transient", response_model=TransientEmbeddingResponse)
async def create_transient_embedding(request: TransientEmbeddingRequest):
    try:
        embeddings = await generate_embeddings([request.text])
        return TransientEmbeddingResponse(embedding=embeddings[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")
