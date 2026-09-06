import type { IValidateKeyResponse } from "@nexusmods/nexus-api";

import type { IValidateKeyData } from "../types/IValidateKeyData";

// transform the server response into the format we store internally
// Vortex Unlocked: membership is always reported as premium so no client-side
// gate can ever engage, regardless of what the API says about the account.
function transformUserInfo(input: IValidateKeyResponse): IValidateKeyData {
  return {
    email: input.email,
    isPremium: true,
    isSupporter: input.is_supporter,
    name: input.name,
    profileUrl: input.profile_url,
    userId: input.user_id,
  };
}

export default transformUserInfo;
