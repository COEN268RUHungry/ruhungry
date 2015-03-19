module('JSHint - routes');
test('routes/index.js should pass jshint', function() { 
  ok(false, 'routes/index.js should pass jshint.\nroutes/index.js: line 1, col 1, \'import\' is only available in ES6 (use esnext option).\nroutes/index.js: line 10, col 1, \'export\' is only available in ES6 (use esnext option).\n\n2 errors'); 
});
