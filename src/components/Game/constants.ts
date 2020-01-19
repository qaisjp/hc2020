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
  SPEAR_CREATED: 4,
  SYNC_SPEARS: 5,
  SPEAR_PICKED_UP: 6,
  MONSTERS_UPDATE: 7,
  PLAYER_DEAD: 8,
  DEAD_MONSTER: 9
};
export const NETWORK_STATUS_CLEAR_TIME = 5000;
export const GAME_FONT = "plumber_bros";
