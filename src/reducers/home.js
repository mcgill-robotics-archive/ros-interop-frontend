import { createReducer } from 'redux-act-reducer';

const defaultState = {
  isFetching: false,
  lastUpdated: undefined,
  err: undefined,
  info: undefined,
  infoAsync: undefined,
  name: undefined
};

const home = createReducer({
}, defaultState);

export default home;
