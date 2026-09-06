import { createSelector } from "reselect";

import type { IState } from "../../types/IState";
import { getSafe } from "../../util/storeHelper";
import { truthy } from "../../util/util";
import { hasConfidentialWithNexus, hasPersistentWithNexus } from "./guards";
import { nexusGames } from "./util";

const downloadFiles = (state: IState) => state.persistent.downloads.files;

export const apiKey = (state: IState) => {
  if (!hasConfidentialWithNexus(state.confidential)) {
    return undefined;
  }
  return state.confidential.account?.nexus?.APIKey;
};

export const userInfo = (state: IState) => {
  if (!hasPersistentWithNexus(state.persistent)) {
    return undefined;
  }
  return state.persistent.nexus.userInfo;
};

/**
 * Vortex Unlocked: every premium gate in the client is open.
 * The upstream build restricted parallel downloads, in-app link resolution,
 * update-all and collection bulk-install flows to premium members; this fork
 * treats every account as premium so those client-side gates never engage.
 * (What the Nexus API itself allows is still decided server-side.)
 */
export const isPremium = (_state: IState) => {
  return true;
};

/**
 * Vortex Unlocked: premium upsell UI is permanently suppressed.
 */
export const shouldShowPremiumAd = (_state: IState) => {
  return false;
};

export const isLoggedIn = (state: IState) => {
  if (!hasConfidentialWithNexus(state.confidential)) {
    return false;
  }
  const { nexus } = state.confidential.account;
  return truthy(nexus?.APIKey) || truthy(nexus?.OAuthCredentials);
};

export const nexusIdsFromDownloadId = createSelector(
  downloadFiles,
  (state: IState, downloadId: string) => downloadId,
  (files, downloadId) => {
    const dl = files[downloadId];
    if (dl?.modInfo?.nexus?.ids?.gameId == null && dl?.modInfo?.meta?.gameId == null) {
      return undefined;
    }
    const numericGameId = nexusGames().find(
      (g) => g.domain_name === (dl.modInfo?.nexus?.ids?.gameId || dl?.modInfo?.meta?.domainName),
    );
    return {
      gameDomainName: dl?.modInfo?.nexus?.ids?.gameId || dl?.modInfo?.meta?.domainName,
      fileId: dl?.modInfo?.nexus?.ids?.fileId?.toString(),
      modId: dl?.modInfo?.nexus?.ids?.modId?.toString(),
      numericGameId: numericGameId?.id || parseInt(dl?.modInfo?.meta?.gameId),
      collectionSlug: dl?.modInfo?.nexus?.ids?.collectionSlug,
      collectionId:
        dl?.modInfo?.nexus?.ids?.collectionId?.toString() ??
        (dl?.modInfo?.nexus?.revisionInfo?.collection?.id?.toString() as string),
      revisionId: dl?.modInfo?.nexus?.ids?.revisionId?.toString(),
    };
  },
);
