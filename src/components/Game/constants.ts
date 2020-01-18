/**
 * networking constants
 */
export const PeerJsEvents = {
  OPEN: "open",
  CONNECTION: "connection",
  DISCONNECTED: "disconnected",
  CLOSE: "close",
  DATA: "data",
  ERROR: "error"
};
export const PeerJsMsgType = {
  HELLO: 0,
  PLAYER_UPDATE: 1,
  BLOCK_BUMP: 2,
  ITEM_BLOCK_BUMP: 3,
  SPEAR_CREATED: 4
};
export const NETWORK_STATUS_CLEAR_TIME = 5000;
export const GAME_FONT = "plumber_bros";
