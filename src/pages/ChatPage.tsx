import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, User as UserIcon, MoreVertical, Phone, Video, Paperclip, Smile, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ChatPage = ({ user }: { user: User | null }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const newSocket = io();
    setSocket(newSocket);

    const fetchRooms = async () => {
      // In a real app, we'd have a 'rooms' collection. 
      // For this demo, we'll find unique conversations from messages.
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const q2 = query(
        collection(db, 'messages'),
        where('receiverId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
      const allMsgs = [...snap1.docs, ...snap2.docs].map(d => d.data());
      
      const uniqueRooms = Array.from(new Set(allMsgs.map(m => m.roomId))).map(id => {
        const lastMsg = allMsgs.find(m => m.roomId === id);
        const otherId = lastMsg.senderId === user.uid ? lastMsg.receiverId : lastMsg.senderId;
        return { id, otherId, lastContent: lastMsg.content, timestamp: lastMsg.timestamp };
      });

      // Fetch other user details
      const roomsWithUsers = await Promise.all(uniqueRooms.map(async (room) => {
        const userDoc = await getDoc(doc(db, 'users', room.otherId));
        return { ...room, otherUser: userDoc.data() };
      }));

      setRooms(roomsWithUsers);
      setLoading(false);
    };

    fetchRooms();

    return () => {
      newSocket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join_room', roomId);
      
      const fetchMessages = async () => {
        const q = query(
          collection(db, 'messages'),
          where('roomId', '==', roomId),
          orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);
        setMessages(snap.docs.map(d => d.data()));
      };
      fetchMessages();

      socket.on('receive_message', (data) => {
        setMessages(prev => [...prev, data]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !roomId || !user || !activeRoom) return;

    const messageData = {
      roomId,
      senderId: user.uid,
      receiverId: activeRoom.otherId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Emit via socket for real-time
    socket.emit('send_message', messageData);

    // Save to Firestore
    await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-128px)]">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 h-full flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-full" />
                    <div className="flex-grow space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    navigate(`/messages/${room.id}`);
                    setActiveRoom(room);
                  }}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all border-l-4 ${
                    roomId === room.id ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'
                  }`}
                >
                  <img src={room.otherUser?.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div className="flex-grow text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-gray-900 truncate">{room.otherUser?.displayName}</p>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {room.timestamp ? format(new Date(room.timestamp?.toDate() || room.timestamp), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{room.lastContent}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <MessageSquare size={32} />
                </div>
                <p className="text-gray-500 text-sm">No messages yet. Start a conversation from a gig or job!</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-grow flex-col bg-gray-50/30">
          {roomId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <img src={activeRoom?.otherUser?.photoURL} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                  <div>
                    <h3 className="font-bold text-gray-900">{activeRoom?.otherUser?.displayName}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Phone size={20} /></button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Video size={20} /></button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group`}>
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1 font-bold text-gray-400 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                          {format(new Date(msg.timestamp?.toDate?.() || msg.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
                  <div className="flex-grow relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">
                <Sparkles size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500 max-w-xs">Choose a chat from the sidebar to start messaging with freelancers or clients.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
