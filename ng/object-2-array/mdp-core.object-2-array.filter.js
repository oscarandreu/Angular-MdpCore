module.exports = function() {
    return function(input) {
        var out = []; 
        for (var i in input) {
          out.push(input[i]);
        }
        return out;
    };
}