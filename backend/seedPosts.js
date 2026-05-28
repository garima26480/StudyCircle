const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const PublicPost = require("./models/PublicPost");

dotenv.config();

const samplePosts = [
  {
    content: "Did you know that relational databases use B-Trees for indexing? It reduces the time complexity of searches to logarithmic O(log N) which makes querying millions of records nearly instantaneous! #database #indexing",
    subject: "DBMS",
    language: "English"
  },
  {
    content: "Der, Die, Das - the three German articles. A quick tip for remembering genders: 60% of German nouns ending in '-e' are feminine (Die), while almost all nouns ending in '-ismus', '-ent', or '-ant' are masculine (Der)! #german #language",
    subject: "German",
    language: "German"
  },
  {
    content: "React 19 Server Actions are amazing! They allow you to invoke server-side database mutations directly from client-side forms without manually writing fetch/axios endpoints. Absolute game changer for productivity! #react #webdev",
    subject: "React",
    language: "English"
  },
  {
    content: "Quick reminder on Operating Systems: A 'Deadlock' occurs when four conditions are met simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. You can prevent it by breaking any one of these! #os #deadlocks",
    subject: "OS",
    language: "English"
  },
  {
    content: "Python list comprehensions are elegant but remember readability! `[x for x in data if x > 10]` is clean, but nesting multiple loops in a single line makes debugging a nightmare. Keep it simple! #python #clean-code",
    subject: "Python",
    language: "English"
  },
  {
    content: "La diferencia entre 'por' y 'para' en español: 'Por' se usa para causa, motivo o duración (gracias por la ayuda), mientras que 'Para' se usa para propósitos, destinatarios o fechas límite (este regalo es para ti). #spanish #grammar",
    subject: "Spanish",
    language: "Spanish"
  },
  {
    content: "An essential tip for computer networks: The Three-Way Handshake in TCP is SYN, SYN-ACK, and ACK. This guarantees a reliable, state-oriented connection between client and server before data begins transferring. #networks #tcp",
    subject: "Networks",
    language: "English"
  },
  {
    content: "Teachers and students, check out this quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.' - Mahatma Gandhi. Let's keep sharing knowledge in this public portal! #learning #inspiration",
    subject: "Motivation",
    language: "English"
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studycircle";
    console.log("Connecting to database at:", mongoUri);
    await mongoose.connect(mongoUri);

    // Fetch existing users from database
    const users = await User.find();

    if (users.length === 0) {
      console.warn("⚠️ No existing users found in the database. Please register a student or teacher account first via the signup pages, then run this script again to seed posts under their names!");
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${users.length} existing users in the database.`);

    // Clear existing public posts to start clean
    await PublicPost.deleteMany();
    console.log("Cleared existing public posts.");

    const postsToInsert = [];

    // Distribute sample posts among existing users
    for (let i = 0; i < samplePosts.length; i++) {
      const sample = samplePosts[i];
      // Pick a random user to author the post
      const randomAuthor = users[Math.floor(Math.random() * users.length)];
      
      // Randomly pick a subset of other users to like this post
      const likesCount = Math.floor(Math.random() * Math.min(5, users.length));
      const postLikes = [];
      const usersCopy = [...users];
      
      for (let j = 0; j < likesCount; j++) {
        const randIdx = Math.floor(Math.random() * usersCopy.length);
        const likedUser = usersCopy.splice(randIdx, 1)[0];
        postLikes.push(likedUser._id);
      }

      postsToInsert.push({
        userId: randomAuthor._id,
        content: sample.content,
        subject: sample.subject,
        language: sample.language,
        likes: postLikes,
        // Spread the timestamps back slightly so they look realistic
        createdAt: new Date(Date.now() - i * 3600000 - Math.random() * 1800000), 
      });
    }

    await PublicPost.insertMany(postsToInsert);
    console.log(`Successfully seeded ${postsToInsert.length} public portal posts with random author and like distributions! 🎉`);

    mongoose.disconnect();
    console.log("Database connection closed cleanly.");
  } catch (error) {
    console.error("❌ Error seeding posts:", error);
    mongoose.disconnect();
  }
};

seedDatabase();
