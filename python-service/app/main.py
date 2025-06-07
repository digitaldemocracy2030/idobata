from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
import os
import chromadb
import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering
from openai import OpenAI
from dotenv import load_dotenv
from google.cloud import storage
import tempfile
import shutil

load_dotenv()

app = FastAPI(title="Idobata Embedding Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default OpenAI client, reads OPENAI_API_KEY from environment automatically
client = OpenAI()
# If you need to explicitly pass the key:
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Cloud Storage settings
BUCKET_NAME = os.getenv("CHROMA_BUCKET_NAME", "idobata-chroma-data")
CHROMA_DB_PATH = "/tmp/chroma"  # Use temporary directory for local storage

def sync_with_cloud_storage():
    """Sync ChromaDB data with Cloud Storage"""
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    
    # Download from Cloud Storage if exists
    if bucket.blob("chroma_data.zip").exists():
        print("Downloading ChromaDB data from Cloud Storage...")
        bucket.blob("chroma_data.zip").download_to_filename("/tmp/chroma_data.zip")
        shutil.unpack_archive("/tmp/chroma_data.zip", CHROMA_DB_PATH)
        print("ChromaDB data downloaded successfully")
    else:
        print("No existing ChromaDB data in Cloud Storage")

def backup_to_cloud_storage():
    """Backup ChromaDB data to Cloud Storage"""
    if os.path.exists(CHROMA_DB_PATH):
        print("Backing up ChromaDB data to Cloud Storage...")
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        
        # Create zip archive
        shutil.make_archive("/tmp/chroma_data", 'zip', CHROMA_DB_PATH)
        
        # Upload to Cloud Storage
        bucket.blob("chroma_data.zip").upload_from_filename("/tmp/chroma_data.zip")
        print("ChromaDB data backed up successfully")

print(f"DEBUG: Initializing ChromaDB with path: {CHROMA_DB_PATH}")

try:
    # Create temporary directory if it doesn't exist
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    
    # Sync with Cloud Storage
    sync_with_cloud_storage()
    
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    print(f"DEBUG: ChromaDB client initialized successfully")
    
    collection = chroma_client.get_or_create_collection(
        name="problems_solutions",
        metadata={"hnsw:space": "cosine"}  # Use cosine similarity
    )
    print(f"DEBUG: ChromaDB collection initialized: {collection.name}")
    
    # Check collection count
    collection_count = collection.count()
    print(f"DEBUG: Collection contains {collection_count} items")
    
except Exception as e:
    print(f"ERROR during ChromaDB initialization: {str(e)}")
    raise e

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
    # Allow either a list of flat clusters or a nested tree structure
    clusters: Union[List[ClusterItem], Dict[str, Any]] = Field(
        ..., description="List of items with cluster assignments (kmeans) or a nested tree structure (hierarchical)"
    )

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    try:
        print(f"DEBUG: Generating embeddings for {len(texts)} texts")
        if texts:
            print(f"DEBUG: First text sample: {texts[0][:100]}...")
        
        # Process in batches of 100 to avoid API limits
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            print(f"DEBUG: Processing batch {i//batch_size + 1} with {len(batch_texts)} texts")
            
            response = client.embeddings.create(
                input=batch_texts,
                model="text-embedding-3-small",
                encoding_format="float" # Recommended for text-embedding-3
            )
            
            batch_embeddings = [embedding.embedding for embedding in response.data]
            all_embeddings.extend(batch_embeddings)
            print(f"DEBUG: Generated {len(batch_embeddings)} embeddings in this batch")
        
        print(f"DEBUG: Generated {len(all_embeddings)} embeddings in total")
        if all_embeddings:
            print(f"DEBUG: First embedding dimensions: {len(all_embeddings[0])}")
            print(f"DEBUG: First embedding sample: {all_embeddings[0][:5]}...")
        
        return all_embeddings
    except Exception as e:
        print(f"ERROR in generate_embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Idobata Embedding Service API"}

@app.post("/api/embeddings/generate", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    print(f"DEBUG: Received embedding request with {len(request.items)} items")
    
    if not request.items:
        print("DEBUG: No items to process")
        return EmbeddingResponse(status="success", generatedCount=0)
    
    texts = [item.text for item in request.items]
    ids = [item.id for item in request.items]
    
    print(f"DEBUG: Processing items with IDs: {ids}")
    print(f"DEBUG: First item ID: {ids[0]}, text sample: {texts[0][:100]}...")
    
    try:
        print("DEBUG: Calling generate_embeddings function")
        embeddings = await generate_embeddings(texts)
        print(f"DEBUG: Successfully generated {len(embeddings)} embeddings")
        
        metadatas = [
            {
                "topicId": item.topicId,
                "questionId": item.questionId if item.questionId else "",
                "itemType": item.itemType
            }
            for item in request.items
        ]
        
        print(f"DEBUG: Prepared metadata for {len(metadatas)} items")
        print(f"DEBUG: First item metadata: {metadatas[0]}")
        
        print("DEBUG: About to upsert to ChromaDB collection")
        print(f"DEBUG: Collection name: {collection.name}")
        print(f"DEBUG: Embeddings shape: {len(embeddings)} items, first embedding dimension: {len(embeddings[0])}")
        
        # Verify data types before upserting
        print(f"DEBUG: IDs type: {type(ids)}, first ID: {ids[0]}, type: {type(ids[0])}")
        print(f"DEBUG: Embeddings type: {type(embeddings)}, first embedding type: {type(embeddings[0])}")
        print(f"DEBUG: Metadatas type: {type(metadatas)}, first metadata type: {type(metadatas[0])}")
        
        try:
            collection.upsert(
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            print("DEBUG: Successfully upserted embeddings to ChromaDB")
            
            # Verify the embeddings were stored by querying one
            verify_result = collection.get(
                ids=[ids[0]],
                include=["embeddings", "metadatas"]
            )
            
            if verify_result and verify_result["ids"]:
                print(f"DEBUG: Verified embedding storage - found ID: {verify_result['ids'][0]}")
                print(f"DEBUG: Retrieved embedding dimensions: {len(verify_result['embeddings'][0])}")
                print(f"DEBUG: Retrieved embedding sample: {verify_result['embeddings'][0][:5]}...")
                print(f"DEBUG: Retrieved metadata: {verify_result['metadatas'][0]}")
            else:
                print("ERROR: Failed to verify embedding storage - could not retrieve the embedding")
        except Exception as upsert_error:
            print(f"ERROR during ChromaDB upsert: {str(upsert_error)}")
            raise upsert_error
        
        return EmbeddingResponse(
            status="success",
            generatedCount=len(embeddings)
        )
    
    except Exception as e:
        print(f"ERROR in create_embeddings: {str(e)}")
        return EmbeddingResponse(
            status="error",
            generatedCount=0,
            errors=[str(e)]
        )

@app.post("/api/vectors/search", response_model=SearchResponse)
async def search_vectors(request: SearchRequest):
    print(f"DEBUG search_vectors: Received request for topicId={request.filter.topicId}, itemType={request.filter.itemType}, k={request.k}")
    print(f"DEBUG search_vectors: Query vector sample (first 5 dims): {request.queryVector[:5]}")
    
    where_filter = {"$and": [{"topicId": request.filter.topicId}]}
    
    if request.filter.questionId:
        where_filter["$and"].append({"questionId": request.filter.questionId})
    
    where_filter["$and"].append({"itemType": request.filter.itemType})
    
    print(f"DEBUG search_vectors: ChromaDB where_filter: {where_filter}")
    
    try:
        results = collection.query(
            query_embeddings=[request.queryVector],
            n_results=request.k,
            where=where_filter,
            include=["distances", "metadatas", "embeddings"] # Include embeddings for debugging
        )
        print(f"DEBUG search_vectors: ChromaDB raw results: {results}") # Log the raw result
        
    except Exception as query_error:
        print(f"ERROR search_vectors: ChromaDB query failed: {str(query_error)}")
        raise HTTPException(status_code=500, detail=f"ChromaDB query failed: {str(query_error)}")

    search_results = []
    if results and results["ids"] and results["ids"][0]:
        print(f"DEBUG search_vectors: Processing {len(results['ids'][0])} results.")
        # Log retrieved embedding sample for the first result if available
        if results.get("embeddings") and len(results["embeddings"]) > 0 and len(results["embeddings"][0]) > 0:
             first_retrieved_embedding = results["embeddings"][0][0]
             print(f"DEBUG search_vectors: First result ({results['ids'][0][0]}) embedding sample: {first_retrieved_embedding[:5]}")
        else:
             print("DEBUG search_vectors: Embeddings not included in results.")

        # Process results
        # Process results if they exist inside the main 'if' block
        for i in range(len(results["ids"][0])):
            search_results.append(
                SearchResult(
                    id=results["ids"][0][i],
                    # Using distance directly as returned by ChromaDB (lower is better for cosine)
                    similarity=float(results["distances"][0][i])
                )
            )
    else:
         # This case handles when the ChromaDB query itself returns empty lists
         print("DEBUG search_vectors: No results found in ChromaDB response (empty lists).")

    # Return the potentially populated search_results list
    return SearchResponse(results=search_results)

    # Return the potentially populated search_results list
    return SearchResponse(results=search_results)

# Helper function to build the tree structure from AgglomerativeClustering results
def build_tree(model, item_ids):
    n_samples = len(item_ids)
    children = model.children_
    n_nodes = children.shape[0] # Number of merge operations
    nodes = {}

    # Initialize leaf nodes
    for i in range(n_samples):
        nodes[i] = {"is_leaf": True, "item_id": item_ids[i], "count": 1}

    # Build internal nodes iteratively
    for i in range(n_nodes):
        node_id = n_samples + i # ID for the new internal node
        child1_id, child2_id = children[i] # IDs of the nodes being merged

        node1 = nodes[child1_id]
        node2 = nodes[child2_id]

        nodes[node_id] = {
            "is_leaf": False,
            "children": [node1, node2],
            "count": node1.get("count", 0) + node2.get("count", 0),
        }
        # Optional: Clean up child nodes from the dictionary if memory becomes an issue for very large trees
        # del nodes[child1_id]
        # del nodes[child2_id]

    # The root node is the last one created, handle case with only one cluster/node
    root_node_id = n_samples + n_nodes - 1 if n_nodes > 0 else 0
    return nodes.get(root_node_id)

@app.post("/api/vectors/cluster", response_model=ClusteringResponse)
async def cluster_vectors(request: ClusteringRequest):
    where_filter = {"$and": [{"topicId": request.filter.topicId}]}
    
    if request.filter.questionId:
        where_filter["$and"].append({"questionId": request.filter.questionId})
    
    where_filter["$and"].append({"itemType": request.filter.itemType})
    
    # Fetch all relevant embeddings first
    # Use collection.get() for potentially better performance when fetching many items by filter
    results = collection.get(
        where=where_filter,
        include=["embeddings", "metadatas"],
        # limit=1000 # Add a limit if necessary, default might be 100
    )
    
    if not results or not results["ids"]:
        print(f"DEBUG cluster_vectors: No items found for filter: {where_filter}")
        return ClusteringResponse(clusters=[])
    
    item_ids = results["ids"]
    embeddings_list = results["embeddings"]

    # Explicitly check if the list is None or empty
    if embeddings_list is None or len(embeddings_list) == 0:
         print(f"DEBUG cluster_vectors: No embeddings found for items: {item_ids}")
         # Return null for clusters field consistent with API definition for empty/error cases
         return ClusteringResponse(clusters=None)
    embeddings_array = np.array(embeddings_list)

    if request.method == "kmeans":
        n_clusters_req = request.params.get("n_clusters", 5) # Default to 5 for kmeans
        n_clusters = 5 # Default value
        # Ensure n_clusters is an integer
        try:
            n_clusters = int(n_clusters_req)
            if n_clusters < 1:
                 print(f"WARNING: n_clusters must be at least 1 for k-means. Defaulting to 5.")
                 n_clusters = 5
        except (ValueError, TypeError):
            print(f"WARNING: Invalid n_clusters value for k-means: {n_clusters_req}. Defaulting to 5.")
            n_clusters = 5

        print(f"DEBUG cluster_vectors: Running K-Means with n_clusters={n_clusters}")
        try:
            # Use n_init='auto' or a specific number like 10 to avoid warnings
            model = KMeans(n_clusters=n_clusters, n_init='auto')
            labels = model.fit_predict(embeddings_array)
        except Exception as kmeans_error:
            print(f"ERROR cluster_vectors: KMeans failed: {str(kmeans_error)}")
            raise HTTPException(status_code=500, detail=f"KMeans clustering failed: {str(kmeans_error)}")

    elif request.method == "hierarchical":
        # Hierarchical clustering now takes no parameters from the request.
        # We will compute the full tree by setting distance_threshold=0.
        linkage = request.params.get("linkage", "ward") # Allow specifying linkage, default to 'ward'

        # --- Parameters for AgglomerativeClustering to compute the full tree ---
        model_params = {
            'linkage': linkage,
            'distance_threshold': 0, # Compute the full tree
            'n_clusters': None      # Must be None when distance_threshold is set
        }
        # 'ward' linkage requires euclidean metric (default).
        # If using a different linkage that works better with cosine distance (like 'average' or 'complete'),
        # you might consider adding 'metric': 'cosine'.
        # if linkage != 'ward':
        #     model_params['metric'] = 'cosine'

        print(f"DEBUG cluster_vectors: Using Hierarchical (full tree) with linkage={linkage}")

        try:
            print(f"DEBUG cluster_vectors: Initializing AgglomerativeClustering with params: {model_params}")
            model = AgglomerativeClustering(**model_params)
            model.fit(embeddings_array) # Fit the model to compute the linkage matrix
        except Exception as model_error:
             print(f"ERROR cluster_vectors: AgglomerativeClustering failed: {str(model_error)}")
             raise HTTPException(status_code=500, detail=f"Clustering model execution failed ({type(model_error).__name__}): {str(model_error)}")

        # Build the tree structure using the computed model attributes
        print(f"DEBUG cluster_vectors: Building tree structure...")
        tree_structure = build_tree(model, item_ids)

        if not tree_structure:
             print(f"ERROR cluster_vectors: Failed to build tree structure.")
             raise HTTPException(status_code=500, detail="Failed to build hierarchical tree structure")

        # Return the hierarchical structure
        return ClusteringResponse(clusters=tree_structure)

    else: # Should not be reached if method is validated earlier, but good practice
        raise HTTPException(status_code=400, detail=f"Unsupported clustering method: {request.method}")

    # This part is now only reached for kmeans
    clusters = []
    for i, label in enumerate(labels):
        item_id = item_ids[i] # Use item_ids fetched via get()
        clusters.append(
            ClusterItem(
                id=item_id,
                cluster=int(label) # Ensure label is int
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

@app.on_event("shutdown")
async def shutdown_event():
    """Backup ChromaDB data to Cloud Storage before shutdown"""
    backup_to_cloud_storage()
