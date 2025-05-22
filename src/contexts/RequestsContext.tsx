import React, { createContext, useContext, useState, useEffect } from 'react';
import { Request, Message, Category, User } from '../types';
import { mockRequests, mockCategories } from '../data/mockData';
import { useAuth } from './AuthContext';

interface RequestsContextType {
  requests: Request[];
  userRequests: Request[];
  categories: Category[];
  activeRequest: Request | null;
  setActiveRequest: (request: Request | null) => void;
  sendMessage: (requestId: string, content: string) => void;
  createRequest: (categoryId: string, subject: string, initialMessage: string) => Promise<void>;
  closeRequest: (requestId: string) => Promise<void>;
  unreadMessages: number;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    setRequests(mockRequests);
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    if (user && user.role !== 'resident') {
      const count = requests.reduce((total, request) => {
        if (user.role === 'admin' || (user.assignedCategories && user.assignedCategories.includes(request.categoryId))) {
          return total + request.messages.filter(msg => !msg.isRead && msg.senderRole === 'resident').length;
        }
        return total;
      }, 0);
      setUnreadMessages(count);
    }
  }, [requests, user]);

  const userRequests = requests.filter(request => {
    if (!user) return false;
    if (user.role === 'resident') return request.residentId === user.id;
    if (user.role === 'employee') {
      return user.assignedCategories?.includes(request.categoryId);
    }
    if (user.role === 'admin') return true;
    return false;
  });

  const sendMessage = (requestId: string, content: string) => {
    if (!user) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setRequests(prevRequests => {
      return prevRequests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            messages: [...request.messages, newMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return request;
      });
    });
    
    if (activeRequest && activeRequest.id === requestId) {
      setActiveRequest({
        ...activeRequest,
        messages: [...activeRequest.messages, newMessage],
        updatedAt: new Date().toISOString()
      });
    }
  };

  const createRequest = async (categoryId: string, subject: string, initialMessage: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');

    const newRequest: Request = {
      id: `req-${Date.now()}`,
      residentId: user.id,
      residentName: user.fullName,
      categoryId,
      categoryName: category.name,
      subject,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          requestId: `req-${Date.now()}`,
          senderId: user.id,
          senderName: user.fullName,
          senderRole: user.role,
          content: initialMessage,
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ]
    };
    
    setRequests(prevRequests => [newRequest, ...prevRequests]);
  };

  const closeRequest = async (requestId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRequests(prevRequests => {
      return prevRequests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: 'closed',
            updatedAt: new Date().toISOString()
          };
        }
        return request;
      });
    });
    
    if (activeRequest && activeRequest.id === requestId) {
      setActiveRequest({
        ...activeRequest,
        status: 'closed',
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <RequestsContext.Provider 
      value={{ 
        requests,
        userRequests,
        categories,
        activeRequest,
        setActiveRequest,
        sendMessage,
        createRequest,
        closeRequest,
        unreadMessages
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
}