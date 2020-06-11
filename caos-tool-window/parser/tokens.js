var _state = {
  _defTokens: null,

  get tokens() {
    return this._defTokens;
  },

  set tokens(newTokens) {
    this._defTokens = newTokens;
  }
};

module.exports = {
  State: _state,
};
