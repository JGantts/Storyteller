module.exports = {
  State: _state,
};

let _tokens = null;
function _getTokens(){
  return _tokens;
}
function _setTokens(tokens){
  _tokens = tokens;
}




var _state = {
  _defTokens: null,

  get tokens() {
    return this.defColor;
  },

  set tokens(newColor) {
    this.defColor = newColor;
  }
};
