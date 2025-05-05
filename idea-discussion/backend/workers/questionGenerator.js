import Problem from "../models/Problem.js";
import SharpQuestion from "../models/SharpQuestion.js";
import { callLLM } from "../services/llmService.js";
import { linkQuestionToAllItems } from "./linkingWorker.js"; // Import the linking function

async function generateSharpQuestions(themeId) {
  console.log(
    `[QuestionGenerator] Starting sharp question generation for theme ${themeId}...`
  );
  try {
    // 1. Fetch all problem statements for this theme
    const problems = await Problem.find({ themeId }, "statement").lean();
    if (!problems || problems.length === 0) {
      console.log(
        `[QuestionGenerator] No problems found for theme ${themeId} to generate questions from.`
      );
      return;
    }
    const problemStatements = problems.map((p) => p.statement);
    console.log(
      `[QuestionGenerator] Found ${problemStatements.length} problem statements for theme ${themeId}.`
    );

    // 2. Prepare prompt for LLM
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant specialized in synthesizing problem statements into insightful "How Might We..." (HMW) questions based on Design Thinking principles. Your goal is to generate concise, actionable, and thought-provoking questions that capture the essence of the underlying challenges presented in the input problem statements. Consolidate similar problems into broader HMW questions where appropriate.

For question 1-3, focus exclusively on describing both the current state ("現状はこう") and the desired state ("それをこうしたい") with high detail. Do NOT suggest or imply any specific means, methods, or solutions in the questions. The questions should keep the problem space open for creative solutions rather than narrowing the range of possible answers.
For question 4-6, focus on questions in the format 「現状は○○だが、それが○○になるの望ましいだろうか？」. This format is intended to question the validity or desirability of the potential future state itself, especially for points where consensus on the ideal might be lacking.

Generate all questions in Japanese language.
All generated text ("question", "tagLine", "tags") should use language easily understandable by those who has completed compulsory education in Japan.
Respond ONLY with a JSON object containing a single key: "questions".
The value of "questions" should be an array of objects. Each object in the array must contain the following keys:
1. "question": A string containing the generated question in Japanese (50-100 characters).
2. "tagLine": A string (14-28 characters) providing a catchy & easy-to-understand summary of the question.
3. "tags": An array of 2 strings, each being a short, simple word (1-10 characters) representing categories for the question.

Generate 6 question objects in total within the "questions" array.
`,
      },
      {
        role: "user",
        content: `Based on the following problem statements, please generate relevant questions in Japanese using the format "How Might We...":\n\n${problemStatements.join("\n- ")}\n\nFor each question, clearly describe both the current state ("現状はこう") and the desired state ("それをこうしたい") with high detail. Focus exclusively on describing these states without suggesting any specific means, methods, or solutions that could narrow the range of possible answers.\n\nPlease provide the output as a JSON object containing a "questions" array, where each element is an object with "question", "tagLine", and "tags" keys.`,
      },
    ];

    // 3. Call LLM
    console.log("[QuestionGenerator] Calling LLM to generate questions...");
    const llmResponse = await callLLM(
      messages,
      true,
      "google/gemini-2.5-pro-preview-03-25"
    ); // Request JSON output with specific model

    if (
      !llmResponse ||
      !Array.isArray(llmResponse.questions) ||
      llmResponse.questions.length === 0
    ) {
      console.error(
        "[QuestionGenerator] Failed to get valid questions array from LLM response:",
        llmResponse
      );
      return;
    }

    const generatedQuestionObjects = llmResponse.questions;
    console.log(
      `[QuestionGenerator] LLM generated ${generatedQuestionObjects.length} question objects.`
    );

    // 4. Save questions to DB (avoid duplicates)
    let savedCount = 0;
    for (const questionObj of generatedQuestionObjects) {
      const questionText = questionObj.question;
      const tagLine = questionObj.tagLine || "";
      const tags = questionObj.tags || [];

      if (!questionText || typeof questionText !== "string") {
        console.warn(
          "[QuestionGenerator] Skipping invalid question object (missing or invalid text):",
          questionObj
        );
        continue;
      }
      try {
        // Use findOneAndUpdate with upsert to avoid duplicates based on questionText and themeId
        const result = await SharpQuestion.findOneAndUpdate(
          { questionText: questionText.trim(), themeId }, // Include themeId in query
          {
            $setOnInsert: {
              questionText: questionText.trim(),
              tagLine: tagLine,
              tags: tags,
              themeId,
              createdAt: new Date(),
            },
          }, // Add themeId and createdAt on insert
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          } // Create if not exists, return the new doc
        );

        // Check if it was an upsert (a new document was created)
        // The result object will contain the _id. If upserted:true is in the result, it's new.
        // A simpler check might be to compare createdAt with a time just before the loop,
        // but checking the result object structure or comparing timestamps is more robust.
        // For simplicity, let's assume if we get a result, we trigger linking.
        // A more precise check would involve comparing timestamps or checking the upserted flag if available in the result.
        if (result?._id) {
          // Trigger linking asynchronously for the new or existing question
          // Linking all items to this question might be resource-intensive.
          // Consider triggering only if it's a truly *new* question.
          // For now, trigger it regardless, as per the simplified approach.
          console.log(
            `[QuestionGenerator] Triggering linking for question ID: ${result._id}`
          );
          setTimeout(() => linkQuestionToAllItems(result._id.toString()), 0);
          savedCount++; // Count successfully processed questions
        } else {
          console.warn(
            `[QuestionGenerator] Failed to save or find question: ${questionText}`
          );
        }
      } catch (dbError) {
        console.error(
          `[QuestionGenerator] Error saving question "${questionText}":`,
          dbError
        );
      }
    }

    console.log(
      `[QuestionGenerator] Successfully processed ${savedCount} questions (new or existing).`
    );
    // Linking is now triggered after each question is saved/upserted above.
  } catch (error) {
    console.error(
      "[QuestionGenerator] Error during sharp question generation:",
      error
    );
  }
}

export { generateSharpQuestions };
