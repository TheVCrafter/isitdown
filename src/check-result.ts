export type CheckStatus = "up" | "down";

export type Responded = {
  readonly outcome: "responded";
  readonly url: string;
  readonly checkedAt: string;
  readonly status: CheckStatus;
  readonly httpStatus: number;
  readonly responseTimeMS: number;
};

export type Failed = {
  readonly outcome: "failed";
  readonly url: string;
  readonly checkedAt: string;
  readonly status: "down";
  readonly error: string;
};

export type CheckResult = Responded | Failed;
