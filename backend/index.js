const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const dbName = "advocatesearch";
const collectionName = "advocates";

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS] ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m[WARNING] ${msg}\x1b[0m`),
  processing: (msg) => console.log(`\x1b[36m[PROCESSING] ${msg}\x1b[0m`),
};

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

let client;
let collection;

async function connectToDatabase() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection(collectionName);
    logger.success("Connected to MongoDB successfully");
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error}`);
    process.exit(1);
  }
}

async function getAdvocates() {
  try {
    const advocates = await collection.find({}).toArray();
    logger.info(`Retrieved ${advocates.length} advocates from database`);
    return advocates;
  } catch (error) {
    logger.error(`Error fetching advocates: ${error}`);
    return [];
  }
}

async function getRandomAdvocate() {
  try {
    const advocates = await collection
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
    logger.info("Retrieved random advocate from database");
    return advocates[0] || null;
  } catch (error) {
    logger.error(`Error fetching random advocate: ${error}`);
    return null;
  }
}

function formatAdvocateData(advocates) {
  return advocates
    .map((advocate, i) => {
      return `Advocate ${i + 1}:
Name: ${advocate.name}
Age: ${advocate.age}
Description: ${advocate.short_description}
Skills: ${advocate.skills}
Experience: ${advocate.experience} years
Gender: ${advocate.gender}
Rating: ${advocate.rating}/10
Email: ${advocate.email}
`;
    })
    .join("\n");
}

function generateAIPrompt(caseDescription, advocatesText) {
  return `
Task: Based on the case description and available advocates, decide:
1. Analyze the legal requirements of the case
2. Select the best-suited advocate (name only)
3. Provide a short justification for the selected advocate
4. Rate the match quality from 1-10 (10 being perfect match)

Rules:
- Do NOT mention advocates not in the list.
- Only suggest ONE advocate who is most suitable.
- Consider specialization, experience, and rating.
- If no advocate seems particularly suitable, rate the match as 5 or below.
- Format the response as:

Match Quality: <rating>/10

Selected Advocate:
<Advocate Name> - <Short reason for selection>

Case Description:
${caseDescription}

Available Advocates:
${advocatesText}
`;
}

async function findBestAdvocate(caseDescription) {
  logger.processing("Analyzing case requirements...");
  const advocates = await getAdvocates();
  if (!advocates || advocates.length === 0) {
    throw new Error("No advocates found in the database.");
  }

  const advocatesText = formatAdvocateData(advocates);
  const prompt = generateAIPrompt(caseDescription, advocatesText);

  try {
    logger.processing("AI processing case description...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Extract match quality
    const matchLine = responseText.match(/Match Quality:\s*(\d+)/i);
    const matchQuality = matchLine ? parseInt(matchLine[1]) : 5;
    const matchAccuracy = matchQuality * 10; // Convert to percentage

    let selectedAdvocate = null;
    let reason = "Selected based on available expertise";

    // If match quality is good (6 or above), try to find the suggested advocate
    if (matchQuality >= 6) {
      logger.processing("Good match found, retrieving advocate details...");
      const lines = responseText.split("\n");
      for (const line of lines) {
        if (line.includes(" - ")) {
          const parts = line.split(" - ");
          if (parts.length >= 2) {
            const name = parts[0].replace("Selected Advocate:", "").trim();
            reason = parts[1].trim();

            const advocateDoc = await collection.findOne({
              name: { $regex: new RegExp(name, "i") },
            });

            if (advocateDoc) {
              selectedAdvocate = advocateDoc;
              break;
            }
          }
        }
      }
    }

    // If no suitable match found or match quality is low, get random advocate
    if (!selectedAdvocate || matchQuality < 6) {
      logger.warning("No specific match found, selecting random advocate...");
      const randomAdvocate = await getRandomAdvocate();
      if (randomAdvocate) {
        selectedAdvocate = randomAdvocate;
        reason =
          matchQuality < 6
            ? "No specific match found - showing available advocate"
            : reason;
      }
    }

    const matchType = matchQuality >= 6 ? "AI Selected" : "Random Selection";
    logger.success(`Match completed with ${matchAccuracy}% accuracy`);

    // Return direct response (not nested)
    return {
      sl_no: selectedAdvocate.sl_no,
      name: selectedAdvocate.name,
      age: selectedAdvocate.age,
      short_description: selectedAdvocate.short_description,
      skills: selectedAdvocate.skills,
      experience: selectedAdvocate.experience,
      gender: selectedAdvocate.gender,
      rating: selectedAdvocate.rating,
      email: selectedAdvocate.email,
      reason,
      matchType,
      matchAccuracy: `${matchAccuracy}%`,
      message:
        matchQuality >= 6
          ? "Good match found based on case requirements"
          : "No specific match found - showing available advocate",
    };
  } catch (error) {
    logger.error("AI processing failed, falling back to random selection");
    // If AI processing fails, return random advocate
    const randomAdvocate = await getRandomAdvocate();
    if (randomAdvocate) {
      return {
        sl_no: randomAdvocate.sl_no,
        name: randomAdvocate.name,
        age: randomAdvocate.age,
        short_description: randomAdvocate.short_description,
        skills: randomAdvocate.skills,
        experience: randomAdvocate.experience,
        gender: randomAdvocate.gender,
        rating: randomAdvocate.rating,
        email: randomAdvocate.email,
        reason: "AI processing failed - showing available advocate",
        matchType: "Random Selection",
        matchAccuracy: "50%",
        message: "AI processing failed - showing available advocate",
      };
    }
    throw new Error(`Error processing AI response: ${error.message}`);
  }
}

app.get("/", (_req, res) => {
  res.json({
    message: "Advocate Assignment AI",
    usage:
      "POST /match-advocate with { description: '...' } to get advocate recommendations.",
  });
});

app.post("/match-advocate", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        error:
          "Please provide a detailed case description (min 20 characters).",
      });
    }

    logger.processing("Starting advocate matching process...");
    const result = await findBestAdvocate(description);
    logger.success("Advocate matching process completed successfully!");
    res.json(result);
  } catch (error) {
    logger.error(`Advocate matching failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Additional endpoint to get all advocates
app.get("/advocates", async (req, res) => {
  try {
    const advocates = await getAdvocates();
    res.json({
      total: advocates.length,
      advocates: advocates,
    });
  } catch (error) {
    logger.error(`Error fetching advocates: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Additional endpoint to get a random advocate
app.get("/random-advocate", async (req, res) => {
  try {
    const advocate = await getRandomAdvocate();
    if (advocate) {
      res.json({
        sl_no: advocate.sl_no,
        name: advocate.name,
        age: advocate.age,
        short_description: advocate.short_description,
        skills: advocate.skills,
        experience: advocate.experience,
        gender: advocate.gender,
        rating: advocate.rating,
        email: advocate.email,
        matchType: "Random Selection",
        matchAccuracy: "50%",
      });
    } else {
      res.status(404).json({ error: "No advocates found" });
    }
  } catch (error) {
    logger.error(`Error fetching random advocate: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
});
