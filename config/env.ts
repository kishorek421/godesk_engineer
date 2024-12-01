const LOCAL_BASE_URL = "http://192.168.0.155:8089";
const DEV_BASE_URL = "http://43.205.35.224:8089";
const STAGE_BASE_URL = "http://65.0.35.228:8090";
const PROD_BASE_URL = "https://workplace.godesk.co.in/api";

enum ENVS {
  local,
  dev,
  stage,
  prod,
}

// let env: ENVS = ENVS.local;
// let env: ENVS = ENVS.dev;
 let env: ENVS = ENVS.stage;
// let env: ENVS = ENVS.prod;

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

export const BASE_URL = getBaseURL(env);

