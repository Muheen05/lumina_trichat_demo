import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Server, MessageSquare, AlertCircle, CheckCircle, Database, User, Code2 } from 'lucide-react';

// Declaration for the global functions injected in index.html
declare global {
  interface Window {
    sendMessage?: (message: string, customerId: string) => Promise<any>;
    TRICHAT_BASE_URL?: string;
  }
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error';
  method?: string;
  url?: string;
  data: any;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  status: 'sending' | 'sent' | 'error';
}

export const IntegrationGuide: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', text: 'Hello! Type a message to test the updated REST API integration.', sender: 'agent', status: 'sent' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [customerId, setCustomerId] = useState(`cust_${Math.floor(Math.random() * 10000)}`);
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to add logs to the console
  const addLog = (type: LogEntry['type'], data: any, method?: string, url?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      method,
      url,
      data
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsgText = inputValue;
    const msgId = Math.random().toString(36).substr(2, 9);
    
    // 1. Add User Message to UI
    setMessages(prev => [...prev, { id: msgId, text: userMsgText, sender: 'user', status: 'sending' }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if global function exists
      if (typeof window.sendMessage !== 'function') {
        throw new Error("window.sendMessage is not defined. Ensure index.html has the script loaded.");
      }

      // Get the URL from global scope if available for logging, otherwise guess
      const targetUrl = (window as any).TRICHAT_BASE_URL 
        ? `${(window as any).TRICHAT_BASE_URL}/messages` 
        : 'http://localhost:8080/api/v1/messages';

      // 2. Log the intent (we can't see the exact request inside the global function, but we know what we passed)
      addLog('request', {
        message: userMsgText,
        customerId: customerId,
        widgetId: 'default',
        note: 'Calling window.sendMessage()'
      }, 'POST', targetUrl);

      // 3. Execute the GLOBAL function from index.html
      const responseData = await window.sendMessage(userMsgText, customerId);

      // 4. Log the Response
      addLog('response', responseData, 'POST', targetUrl);

      // 5. Update UI
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'sent' } : m));
      
      if (responseData && (responseData.reply || responseData.message)) {
        setMessages(prev => [...prev, { 
          id: `reply_${Date.now()}`, 
          text: responseData.reply || responseData.message, 
          sender: 'agent', 
          status: 'sent' 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: `reply_${Date.now()}`, 
          text: "Message sent (No reply content received).", 
          sender: 'agent', 
          status: 'sent' 
        }]);
      }

    } catch (error: any) {
      console.error(error);
      // 6. Handle Errors
      addLog('error', { 
        message: error.message, 
        stack: error.stack,
        hint: 'Network Error usually means the server is not running on localhost:8080 or CORS is blocked.' 
      });
      
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'error' } : m));
      
      setMessages(prev => [...prev, { 
        id: `err_${Date.now()}`, 
        text: "Connection Failed. Check if your local server is running on port 8080.", 
        sender: 'agent', 
        status: 'error' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Custom CRM Integration
          </h2>
          <div className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto flex items-center justify-center gap-2">
            <Code2 size={20} className="text-blue-500" />
            <span>Using Global Script (`window.sendMessage`) from index.html</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 h-[600px]">
          
          {/* LEFT: Custom Chat Interface */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Support Chat</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    API Connected
                  </p>
                </div>
              </div>
              <div className="text-xs bg-blue-700 px-2 py-1 rounded">
                REST Mode
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.sender === 'agent' && msg.status === 'error' ? (
                       <div className="flex items-center gap-2 text-red-600 font-medium">
                         <AlertCircle size={16} />
                         {msg.text}
                       </div>
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                  </div>
                  {msg.sender === 'user' && msg.status === 'error' && (
                    <div className="flex items-center ml-2 text-red-500" title="Failed to send">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Calls <code>sendMessage()</code> defined in index.html
              </p>
            </form>
          </div>

          {/* RIGHT: Network Logger */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 flex flex-col overflow-hidden font-mono text-sm">
            <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-200">
                <Terminal size={18} className="text-green-400" />
                <span className="font-semibold">Network Activity Log</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                  <AlertCircle size={12} />
                  Local API Warning
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border-b border-yellow-900/50 p-2 text-xs text-yellow-200/80 px-4">
               <strong>Note:</strong> The CRM code now points to <code>http://localhost:8080/api/v1</code>. 
               Requests will fail unless you have the TriChat backend server running locally on port 8080 with CORS enabled.
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {logs.length === 0 && (
                <div className="text-slate-500 text-center mt-20 italic">
                  Waiting for network activity...<br/>
                  Send a message to see the request.
                </div>
              )}
              
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 pl-3 py-1 animate-in fade-in slide-in-from-left-2 duration-300" 
                  style={{ borderColor: log.type === 'error' ? '#ef4444' : log.type === 'response' ? '#22c55e' : '#3b82f6' }}>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-500 text-xs">[{log.timestamp}]</span>
                    <span className={`text-xs font-bold uppercase ${
                      log.type === 'error' ? 'text-red-400' : log.type === 'response' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {log.type}
                    </span>
                    {log.method && <span className="text-slate-400 text-xs bg-slate-800 px-1 rounded">{log.method}</span>}
                  </div>

                  {log.url && <div className="text-slate-400 text-xs mb-2 break-all">{log.url}</div>}

                  <pre className={`text-xs p-2 rounded overflow-x-auto ${
                    log.type === 'error' ? 'bg-red-950/30 text-red-200' : 'bg-slate-800/50 text-slate-300'
                  }`}>
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            
            <div className="bg-slate-800 p-2 text-xs text-slate-500 flex justify-between px-4">
               <span>API Key: tc_7kk...68298</span>
               <span>Status: Code Injected</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};