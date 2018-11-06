module.exports = {
    'ifEquals': function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    'ifInside': function(item, lst, options) {
        return (lst && lst.includes(item)) ? options.fn(this) : options.inverse(this);
    }
}