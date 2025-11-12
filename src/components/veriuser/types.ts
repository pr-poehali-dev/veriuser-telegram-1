export interface Patent {
  id: string;
  text: string;
}

export interface User {
  id: string;
  owner: string;
  username: string;
  channelOrProfile: string;
  age: string;
  reason: string;
  patents: Patent[];
  status: string;
  statusNote: string;
  otherSocialNetworks: string;
  createdAt: string;
  photoUrl?: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
}