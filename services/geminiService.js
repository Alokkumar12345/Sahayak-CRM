const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const Complaint = require('../models/Complaint');

const SYSTEM_PROMPT = `
You are a helpful CRM assistant for an electrical appliance repair shop chain 
with 5 shops across India. You help customers file complaints and answer 
questions about their appliances and repair services.

You support Hindi, Punjabi, Bengali, Tamil, and English.
Always respond in the same language the user writes in.
Be concise, friendly, and helpful.

Shop List:
- Shop 1: Delhi
- Shop 2: Amritsar  
- Shop 3: Kolkata
- Shop 4: Chennai
- Shop 5: Mumbai

Products serviced: AC, Refrigerator, Washing Machine, Microwave, 
TV, Water Heater, Fan, Mixer/Grinder, Induction Cooktop.

When helping file a complaint, collect: name, phone, shop, product, 
machine ID, problem description, severity, and address.
`;

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash");

const fileComplaintDeclaration = {
  name: "file_complaint",
  description: "File a complaint into the CRM system",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      phone: { type: SchemaType.STRING },
      shop: { type: SchemaType.STRING },
      product: { type: SchemaType.STRING },
      machineId: { type: SchemaType.STRING },
      problem: { type: SchemaType.STRING },
      severity: { type: SchemaType.STRING },
      address: { type: SchemaType.STRING },
    },
    required: ["name", "phone", "shop", "product", "machineId", "problem", "severity", "address"],
  },
};

const getComplaintsDeclaration = {
  name: "get_complaints",
  description: "Get complaints from the CRM system",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      shop: { type: SchemaType.STRING, description: "Filter by shop. Values like Delhi, Amritsar, Kolkata, Chennai, Mumbai" },
      status: { type: SchemaType.STRING, description: "Filter by status. e.g. Pending, Resolved" },
    },
  },
};

async function getChatResponse(messages, isAdmin = false, language = 'english') {
  console.log(`[Gemini] Request received. isAdmin: ${isAdmin}, Message Count: ${messages.length}, Language: ${language}`);
  try {
    const activeTools = isAdmin 
      ? [{ functionDeclarations: [getComplaintsDeclaration] }]
      : [{ functionDeclarations: [fileComplaintDeclaration] }];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT + `\n\nThe current user language preference is ${language}. Please ensure your response matches this language.`,
      tools: activeTools
    });

    // Formatting frontend structure [{role: 'user/assistant', content: '...'}] to Gemini format
    let rawHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    // Gemini API requires history to start with 'user', strictly alternate, and end with 'model' before a new 'user' prompt
    let history = [];
    let expectedRole = 'user';
    
    for (const msg of rawHistory) {
      if (msg.role === expectedRole) {
        history.push(msg);
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }
    
    // If the next message is from 'user' (currentMessage), the last history item must be 'model'
    if (history.length % 2 !== 0) {
      history.pop();
    }
    
    // The last message is the current prompt
    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(currentMessage);
    const functionCalls = result.response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      let fnResult = {};
      
      try {
        if (call.name === "file_complaint") {
          const args = call.args;
          const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
          const randomNum = Math.floor(100 + Math.random() * 900);
          const ticketId = `TKT-${dateStr}-${randomNum}`;
          
          args.ticketId = ticketId;
          const newComplaint = new Complaint(args);
          await newComplaint.save();
          fnResult = { success: true, ticketId, message: "Complaint filed successfully." };
        } else if (call.name === "get_complaints") {
          const filters = {};
          if (call.args.shop) filters.shop = call.args.shop;
          if (call.args.status) filters.status = call.args.status;
          
          const complaints = await Complaint.find(filters).sort({ createdAt: -1 }).limit(10);
          fnResult = { complaints };
        }
      } catch (err) {
        fnResult = { error: err.message };
      }

      const result2 = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: fnResult
        }
      }]);
      const textResponse = result2.response.text();
      console.log(`[Gemini] Final Tool Response: ${textResponse}`);
      return textResponse || "Action completed. How else can I help?";
    }

    const textResponse = result.response.text();
    console.log(`[Gemini] Final Response: ${textResponse}`);
    return textResponse || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    // Log the full error object for deep debugging
    if (error.response) {
      console.error("Gemini API Error Response:", JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

module.exports = { getChatResponse };
