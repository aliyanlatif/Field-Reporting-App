import { create } from 'zustand';
import { getReportRepository } from '../db';
import { describeFailure } from '../features/delivery';
import { api } from '../services/api';
import { LocalReport, RemoteReport } from '../types';

interface ReportsState {
  local: LocalReport[];
  remote: RemoteReport[];
  remoteLoaded: boolean;
  remoteLoading: boolean;
  remoteError: string | null;
  refreshLocal: () => Promise<void>;
  refreshRemote: () => Promise<void>;
  handleQueueChange: () => Promise<void>;
  /** Drops a deleted report from view straight away, without waiting for the next fetch. */
  forget: (reportId: string) => void;
  clear: () => void;
}

const initialState = {
  local: [],
  remote: [],
  remoteLoaded: false,
  remoteLoading: false,
  remoteError: null,
};

let localRefresh: Promise<void> | null = null;
let localRefreshQueued = false;
let remoteSequence = 0;

export const useReportsStore = create<ReportsState>()((set, get) => ({
  ...initialState,

  refreshLocal() {
    if (localRefresh) {
      localRefreshQueued = true;
      return localRefresh;
    }
    localRefresh = (async () => {
      try {
        do {
          localRefreshQueued = false;
          set({ local: await (await getReportRepository()).list() });
        } while (localRefreshQueued);
      } finally {
        localRefresh = null;
      }
    })();
    return localRefresh;
  },

  async refreshRemote() {
    const sequence = ++remoteSequence;
    set({ remoteLoading: true });
    try {
      const remote = await api.listReports();
      if (sequence === remoteSequence) {
        set({
          remote,
          remoteLoaded: true,
          remoteLoading: false,
          remoteError: null,
        });
      }
    } catch (error) {
      if (sequence === remoteSequence) {
        set({ remoteLoading: false, remoteError: describeFailure(error) });
      }
    }
  },

  async handleQueueChange() {
    await get().refreshLocal();
    const { local, remote } = get();
    const knownToServer = new Set(remote.map(report => report.id));
    if (
      local.some(
        report => report.status === 'uploaded' && !knownToServer.has(report.id),
      )
    ) {
      await get().refreshRemote();
    }
  },

  forget(reportId) {
    set(state => ({
      local: state.local.filter(report => report.id !== reportId),
      remote: state.remote.filter(report => report.id !== reportId),
    }));
  },

  clear() {
    remoteSequence++;
    set(initialState);
  },
}));
