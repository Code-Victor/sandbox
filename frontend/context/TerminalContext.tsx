"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { createTerminal as createTerminalHelper, closeTerminal as closeTerminalHelper } from '@/lib/terminal';

interface TerminalContextType {
  socket: Socket | null;
  terminals: { id: string; terminal: Terminal | null }[];
  setTerminals: React.Dispatch<React.SetStateAction<{ id: string; terminal: Terminal | null }[]>>;
  activeTerminalId: string;
  setActiveTerminalId: React.Dispatch<React.SetStateAction<string>>;
  creatingTerminal: boolean;
  setCreatingTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  createNewTerminal: (command?: string) => Promise<void>;
  closeTerminal: (id: string) => void;
  setUserAndSandboxId: (userId: string, sandboxId: string) => void;
  deploy: (callback: () => void) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [terminals, setTerminals] = useState<{ id: string; terminal: Terminal | null }[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string>('');
  const [creatingTerminal, setCreatingTerminal] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);

  useEffect(() => {
    if (userId && sandboxId) {
      console.log("Initializing socket connection...");
      const newSocket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}?userId=${userId}&sandboxId=${sandboxId}`);
      console.log("Socket instance:", newSocket);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log("Socket disconnected");
      });

      return () => {
        console.log("Disconnecting socket...");
        newSocket.disconnect();
      };
    }
  }, [userId, sandboxId]);

  const createNewTerminal = async (command?: string): Promise<void> => {
    if (!socket) return;
    setCreatingTerminal(true);
    try {
      createTerminalHelper({
        setTerminals,
        setActiveTerminalId,
        setCreatingTerminal,
        command,
        socket,
      });
    } catch (error) {
      console.error("Error creating terminal:", error);
    } finally {
      setCreatingTerminal(false);
    }
  };

  const closeTerminal = (id: string) => {
    if (!socket) return;
    const terminalToClose = terminals.find(term => term.id === id);
    if (terminalToClose) {
      closeTerminalHelper({
        term: terminalToClose,
        terminals,
        setTerminals,
        setActiveTerminalId,
        setClosingTerminal: () => {}, 
        socket,
        activeTerminalId,
      });
    }
  };

  const setUserAndSandboxId = (newUserId: string, newSandboxId: string) => {
    setUserId(newUserId);
    setSandboxId(newSandboxId);
  };

  const deploy = (callback: () => void) => {
    if (!socket) console.error("Couldn't deploy: No socket");
    console.log("Deploying...")
    socket?.emit("deploy", () => {
      callback();
    });
  }

  const value = {
    socket,
    terminals,
    setTerminals,
    activeTerminalId,
    setActiveTerminalId,
    creatingTerminal,
    setCreatingTerminal,
    createNewTerminal,
    closeTerminal,
    setUserAndSandboxId,
    deploy
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = (): TerminalContextType => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};