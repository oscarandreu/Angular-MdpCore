// startFrom filter
module.exports = function() {
    return function(input, start) {
        if (input) {
            start = +start; //convert to int
            return input.slice(start);
        }
        return [];
    };
}