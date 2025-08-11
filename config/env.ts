// http
const LOCAL_BASE_URL = "http://192.168.0.155:8089";
const DEV_BASE_URL = "http://13.201.225.84:8090";
const STAGE_BASE_URL = "http://65.0.35.228:8090";
const PROD_BASE_URL = "https://workplace.godezk.com/api";
// ws
const LOCAL_BASE_WS_URL = "ws://127.0.0.1:5000/";
const DEV_BASE_WS_URL = "ws://13.201.225.84:8090/app/engineer";

enum ENVS {
  local,
  dev,
  stage,
  prod,
}

// const env: ENVS = ENVS.local;
const env: ENVS = ENVS.dev;
// const env: ENVS = ENVS.stage;
// const env: ENVS = ENVS.prod;

const getBaseURL = (iENV: ENVS) => {
  switch (iENV) {
    case ENVS.local:
      return LOCAL_BASE_URL;
    case ENVS.dev:
      return DEV_BASE_URL;
    case ENVS.stage:
      return STAGE_BASE_URL;
    case ENVS.prod:
      return PROD_BASE_URL;
  }
};

const getApiBaseWSURL = (iENV: ENVS) => {
  switch (iENV) {
    case ENVS.dev:
      return DEV_BASE_WS_URL;
    default:
      return LOCAL_BASE_WS_URL;
  }
};

export const BASE_URL = getBaseURL(env);
export const API_BASE_WS_URL = getApiBaseWSURL(env);
