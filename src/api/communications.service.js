// Mock adapter, following admin.service.js. Replace these functions with API calls
// when communications endpoints are available. Changes last until a page reload.
const names = {
  customers: ["Chidinma Obi", "Amaka Uche", "Eze John", "John Mike"],
  riders: ["Emeka Nwankwo", "Tunde Balogun", "Bisi Adebayo"],
  fleet: ["Swift Logistics", "Quick Move"],
};
const conversations = Object.entries(names).flatMap(([group, people]) => people.map((name, i) => ({
  id: `${group}-${i + 1}`, group, name, unread: true,
  // Seed segment membership for demonstrating customer-only broadcasts.
  customerGroups: group === "customers" ? [i < 2 ? "new-customers" : "inactive-customers"] : [],
  role: group === "customers" ? "Customer" : group === "riders" ? "Rider" : "Fleet owner",
  order: `ORD-${48201 + i}`, subject: "Damaged item",
  phone: "+234 803 555 0142", email: `${name.toLowerCase().replaceAll(" ", ".")}@mail.com`,
  preview: group === "customers" ? "Hi, My package still hasn't arrived its over an hour" : group === "riders" ? "Hello, I need help with my current delivery." : "Hi, I have a question about our fleet deliveries.",
  messages: [
    { id: "m1", text: "Hello, my parcel arrived with the box dented and the item inside is broken.", time: "09:02", sender: "contact" },
    { id: "m2", text: "I have photos if you need them.", time: "09:03", sender: "contact" },
    { id: "m3", text: `Sorry about that, ${name.split(" ")[0]}. Please send the photos and we will start your refund.`, time: "09:10", sender: "admin" },
  ],
  history: [
    { id: "h1", title: "Refund request RFD-3303", description: "Customer message · Pending", date: "Oct 22" },
    { id: "h2", title: "Late delivery complaint", description: "Resolved by support", date: "Sep 30" },
    { id: "h3", title: "Weekend promo", description: "Broadcast · Push", date: "Sep 14" },
  ],
})));
const find = (id) => {
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) throw new Error("Conversation not found.");
  return conversation;
};
const copy = (value) => JSON.parse(JSON.stringify(value));
export const getConversations = async () => copy(conversations);
export const getConversation = async (id) => {
  const conversation = find(id);
  conversation.unread = false;
  return copy(conversation);
};
export const sendReply = async ({ conversationId, text, file }) => {
  if (!text.trim() && !file) throw new Error("Enter a message or attach a file.");
  const conversation = find(conversationId);
  const message = { id: crypto.randomUUID(), text: text.trim(), sender: "admin", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), attachment: file ? { name: file.name, size: file.size } : null };
  conversation.messages.push(message);
  conversation.preview = message.text || file.name;
  return copy(message);
};
export const sendBroadcast = async ({ audience, groups, channels, title, message }) => {
  if (!title.trim() || !message.trim() || !channels.length || (audience === "groups" && !groups.length)) throw new Error("Choose recipients and channels, and fill in your title and message.");
  const broadcast = { id: crypto.randomUUID(), audience, groups, channels, title: title.trim(), message: message.trim(), createdAt: new Date().toISOString() };
  conversations.filter((item) => audience === "all" || (audience === "groups" ? item.customerGroups.some((group) => groups.includes(group)) : item.group === audience)).forEach((item) => {
    item.history.unshift({ id: broadcast.id, title: broadcast.title, description: `Broadcast · ${channels.join(", ")}`, date: "Today" });
  });
  return broadcast;
};
