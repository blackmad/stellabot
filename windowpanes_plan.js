if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ColoringPlanEntry: ColoringPlanEntry
  }
}

function InnerColoringPlanEntry() {
  this.orientation = null;

  this.is_set = function() {
    return this.orientation != null;
  }

  this.set_orientation = function(o) {
    this.orientation = o
  }

  this.set_colors = function(c) {
    this.colors = c;
  }
}

function ColoringPlanEntry(orientation, row, col) {
  this.orientation = orientation;
  this.top = new InnerColoringPlanEntry();
  this.bottom = new InnerColoringPlanEntry();
  this.row = row;
  this.col = col;

  this.unset_entry = function() {
    if (!this.top.is_set()) {
      return this.top;
    } 
    if (!this.bottom.is_set()) {
      return this.bottom;
    } 
    return null;
  }

  this.is_full = function() {
    return !this.is_curve() && (
      !this.top.is_set() || !this.bottom.is_set()
    )
  }

  this.is_empty = function() {
    return this.top.is_set() && this.bottom.is_set();
  }

  this.is_partly_full = function() {
    return !this.is_curve() &&
      (this.top.is_set() || this.bottom.is_set()) &&
      !(this.top.is_set() && this.bottom.is_set())
  }

  this.is_set = function() {
    return this.top.is_set() || this.bottom.is_set()
  }

  this.is_connected_below = function(bottom) {
    return 
      _.contains(['SQ', 'CTL', 'CTR'], this.orientation) &&
      _.contains(['SQ', 'CBR', 'CTR'], bottom.orientation);
  }

  this.is_curve = function() {
    return _.contains(['CTL', 'CTR', 'CBR', 'CBL'], this.orientation);
  }
}