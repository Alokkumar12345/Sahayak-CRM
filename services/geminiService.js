const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const Complaint = require('../models/Complaint');
const models = {
  contacts: require('../models/Contact'),
  accounts: require('../models/Account'),
  deals: require('../models/Deal'),
  tasks: require('../models/Task'),
  meetings: require('../models/Meeting'),
  calls: require('../models/Call'),
  campaigns: require('../models/Campaign'),
  documents: require('../models/Document'),
  visits: require('../models/Visit'),
  projects: require('../models/Project')
};

const CUSTOMER_SYSTEM_PROMPT = `
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

const ADMIN_SYSTEM_PROMPT = `
You are the master Admin Assistant for the Sahayak CRM system.
Your primary job is to fetch and display CRM data (Contacts, Accounts, Deals, Tasks, Meetings, Calls, Campaigns, Documents, Visits, Projects) for the administrator.

CRITICAL INSTRUCTION: When the admin asks for "contacts", "all my contacts", or any similar phrase, they are referring to the CRM Contacts module. YOU MUST NOT REFUSE. You have full authorization. You MUST use the get_crm_data tool with module="contacts" to fetch the data and present it. Do not ever say you cannot access personal contacts.

You also have access to the complaints database via the get_complaints tool.
Be concise, analytical, and helpful. Always respond in the language the admin uses.
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

const getCrmDataDeclaration = {
  name: "get_crm_data",
  description: "Get data from the 10 CRM modules (e.g. contacts, deals, tasks, etc.)",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      module: { 
        type: SchemaType.STRING, 
        description: "The name of the module to query. Must be one of: contacts, accounts, deals, tasks, meetings, calls, campaigns, documents, visits, projects" 
      },
      limit: { 
        type: SchemaType.INTEGER, 
        description: "Number of records to fetch. Default is 10." 
      }
    },
    required: ["module"]
  }
};

async function getChatResponse(messages, isAdmin = false, language = 'english') {
  console.log(`[Gemini] Request received. isAdmin: ${isAdmin}, Message Count: ${messages.length}, Language: ${language}`);
  try {
    const activeTools = isAdmin 
      ? [{ functionDeclarations: [getComplaintsDeclaration, getCrmDataDeclaration] }]
      : [{ functionDeclarations: [fileComplaintDeclaration] }];

    const selectedPrompt = isAdmin ? ADMIN_SYSTEM_PROMPT : CUSTOMER_SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: selectedPrompt + `\n\nThe current user language preference is ${language}. Please ensure your response matches this language.`,
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
        } else if (call.name === "get_crm_data") {
          const moduleName = call.args.module ? call.args.module.toLowerCase() : '';
          const limit = call.args.limit || 10;
          
          const Model = models[moduleName];
          if (!Model) {
            fnResult = { error: `Module '${moduleName}' not found. Valid modules: contacts, accounts, deals, tasks, meetings, calls, campaigns, documents, visits, projects.` };
          } else {
            const data = await Model.find({}).sort({ createdAt: -1 }).limit(limit);
            fnResult = { [moduleName]: data };
          }
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
