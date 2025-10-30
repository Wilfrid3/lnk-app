import {create} from 'zustand';
import {Message} from "../types/Message";
import {User} from "../types/User";

interface StoreState {
  user?: User;
  messages: Message[];
  setUser: (user: User) => void;
  addMessage: (msg: Message) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: undefined,
  messages: [],
  setUser: (user) => set({ user }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));