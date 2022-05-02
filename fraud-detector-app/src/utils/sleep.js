module.exports = function(ms, result = null) {
    return new Promise(resolve => {
        setTimeout(() => resolve(result), ms)
    });
}