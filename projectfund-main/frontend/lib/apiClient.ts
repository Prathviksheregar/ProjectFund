import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Proposal endpoints
  async getProposals(params?: any) {
    return this.client.get('/proposals/', { params });
  }

  async getProposal(id: number) {
    return this.client.get(`/proposals/${id}/`);
  }

  async createProposal(data: any) {
    return this.client.post('/proposals/', data);
  }

  async voteProposal(id: number, support: boolean, tx_hash?: string) {
    return this.client.post(`/proposals/${id}/vote/`, { support, tx_hash });
  }

  async fundProposal(id: number, amount: string, tx_hash: string) {
    return this.client.post(`/proposals/${id}/fund/`, { amount, tx_hash });
  }

  async getProposalVotes(id: number) {
    return this.client.get(`/proposals/${id}/votes/`);
  }

  async getProposalFundings(id: number) {
    return this.client.get(`/proposals/${id}/fundings/`);
  }

  async getTrendingProposals() {
    return this.client.get('/proposals/trending/');
  }

  // User profile endpoints
  async getUserProfile() {
    return this.client.get('/profiles/me/');
  }

  async verifyWallet(walletAddress: string, signature?: string, message?: string) {
    return this.client.post('/profiles/verify_wallet/', {
      wallet_address: walletAddress,
      signature,
      message,
    });
  }

  // Transaction endpoints
  async getUserTransactions(page?: number) {
    return this.client.get('/transactions/', { params: { page } });
  }

  async createTransaction(data: any) {
    return this.client.post('/transactions/create_transaction/', data);
  }

  async confirmTransaction(tx_hash: string) {
    return this.client.post('/transactions/confirm/', { tx_hash });
  }

  // Stats endpoints
  async getContractStats() {
    return this.client.get('/stats/');
  }

  async confirmFunding(fundingId: number) {
    return this.client.post(`/fundings/${fundingId}/confirm/`);
  }
}

export const apiClient = new APIClient();
