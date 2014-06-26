'use strict';

var gulp = require('gulp');
var path = require('path');
var util = require('util');
var colors = require('chalk');
var gutil = require('gulp-util');
var through = require('through2');
var OrderedStreams = require('ordered-read-streams');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');

var SERVER_PORT = process.env.PORT || 9000;
var LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729;
var lr = require('tiny-lr')();

/*
 * Path reference
 */

var paths = (function() {
  var table = {
    'src.project.scripts': ['./*.js'],
    'src.app.static': [
      'app/**/*',
      '!app/scripts/**/*',
      '!app/styles/**/*',
      '!app/bower_components/**/*'
    ],
    'src.app.scripts': ['app/scripts/**/*.js'],
    'src.app.scripts.entry': ['app/scripts/application.js'],
    'src.app.scripts.vendor': require('./app/scripts/vendor.json').include,
    'src.app.templates': ['app/templates/**/*.{hbs,em}'],
    'src.app.styles': ['app/styles/**/*.scss'],
    'src.app.styles.entry': ['app/styles/application.scss'],
    'src.app.styles.vendor': ['app/styles/vendor.scss'],
    'src.app.tests': ['test/app/**/*.js'],
    'src.app.tests.fixtures': ['test/fixtures/**/*.json'],
    'src.app.tests.helpers': [
      'app/bower_components/ember-mocha-adapter/adapter.js',
      'test/app_helper.js'
    ],
    'dest.root': '<%= dist %>',
    'dest.app.static': '<%= dist %>/public',
    'dest.app.scripts': '<%= dist %>/public/scripts',
    'dest.app.styles': '<%= dist %>/public/styles',
  };

  return function(name, options) {
    var opts = options || {};
    var env = opts.env || 'development';
    var distribution = (env === 'distribution');
    var data = {
      'dist': (distribution ? 'dist' : 'tmp'),
      'ember_suffix': (distribution ? '.prod' : '')
    };
    var result = table[name];
    if (typeof result === 'string') { result = _.template(result, data); }
    else if (result instanceof Array) {
      result = _.map(result, function(value) {
        return _.template(value, data);
      });
    }
    else if (!result) { throw new Error('Could not find path for ' + name); }
    return result;
  };
})();


/*
 * Utility
 */

var environment = (function() {
  var set = false;
  var current = null;
  return function(value) {
    if (set && current !== value) {
      throw new Error('Environment already set to ' +
        current + ', cannot change to ' + value);
    }
    set = true;
    current = value;
    return { env: value };
  };
})();


/*
 * Browserify helper
 */

var browserify = function() {
  var create = require('browserify');
  return through.obj(function(file, enc, callback) {
    create(file.path).bundle(function(err, contents) {
      if (err) {
        gutil.log(util.format('%s: %s',
          colors.red('browserify'),
          err.message));
        this.push(null);
      }
      else {
        file.contents = new Buffer(contents);
        this.push(file);
      }
      callback();
    }.bind(this));
  });
};



/*
 * Configurable Tasks
 */

var tasks = {};

tasks['.serve'] = function(options) {
  var opts = options || {};
  var open = opts.restart ? undefined : function() {
    require('open')('http://localhost:' + SERVER_PORT + '/');
  };

  var assets = path.resolve(paths('dest.app.static', opts));
  var app = require('connect')()
    .use(require('connect-livereload')({ port: LIVERELOAD_PORT }))
    .use(require('morgan')('dev'))
    .use(require('serve-static')(assets))
    .use(require('serve-static')(path.join(__dirname, 'app')));
  app.listen(SERVER_PORT, open);

  lr.listen(LIVERELOAD_PORT);
};

tasks['.watch'] = function(options) {
  var opts = options || {};

  if (opts.app) {
    gulp.watch(paths('src.app.scripts', opts), ['lint', '.scripts:app:dev:update']);
    gulp.watch(paths('src.app.templates', opts), ['.scripts:app:dev:update-templates']);
    gulp.watch(paths('src.app.styles', opts), ['.styles:app:dev:update']);
    gulp.watch(paths('src.app.static', opts), ['.static:app:dev']);
    gulp.watch([].concat(
      paths('src.project.scripts', opts),
      paths('src.app.scripts', opts),
      paths('src.app.tests', opts)), ['lint']);
  }

  if (opts.app || opts.testing) {
    gulp.watch(paths('src.project.scripts', opts), ['lint']);
  }
};

tasks['.scripts:app'] = function(options) {
  var opts = options || {};
  var streams = [];
  var env = opts.env || 'development';
  var distribution = (env === 'distribution');

  if (opts.all) {
    opts.vendor = true;
    opts.templates = true;
    opts.scripts = true;
  }

  if (opts.vendor) {
    streams.push(gulp.src(paths('src.app.scripts.vendor', opts))
      .pipe($.concat('vendor.js')));
  }

  if (opts.templates) {
    var hbsFilter = $.filter('**/*.hbs');
    var emFilter = $.filter('**/*.em');
    var moduleOptions = {
      context: function(context) {
        return { name: context.name.replace(/\./, '/') };
      }
    };
    streams.push(gulp.src(paths('src.app.templates', opts))
      .pipe($.plumber())
      .pipe(emFilter)
      .pipe($.emberEmblem())
      .pipe($.defineModule('plain', moduleOptions))
      .pipe(emFilter.restore())
      .pipe(hbsFilter)
      .pipe($.emberHandlebars())
      .pipe($.defineModule('plain', moduleOptions))
      .pipe(hbsFilter.restore())
      .pipe($.concat('templates.js')));
  }

  if (opts.scripts) {
    streams.push(gulp.src(paths('src.app.scripts.entry', opts), { read: false })
      .pipe($.plumber())
      .pipe(browserify()));
  }

  var stream = new OrderedStreams(streams);

  if (distribution) {
    stream = stream
      .pipe($.concat('application.js', { newLine: ';' }))
      .pipe($.uglify());
  }

  stream = stream
    .pipe(gulp.dest(paths('dest.app.scripts', opts)))
    .pipe($.livereload(LIVERELOAD_PORT, { auto: false, silent: true }));

  return stream;
};

tasks['.styles:app'] = function(options) {
  var opts = options || {};
  var env = opts.env || 'development';
  var distribution = (env === 'distribution');

  if (opts.all) {
    opts.vendor = true;
    opts.styles = true;
  }

  var src = [];
  if (opts.vendor) {
    src = src.concat(paths('src.app.styles.vendor', opts));
  }
  if (opts.styles) {
    src = src.concat(paths('src.app.styles.entry', opts));
  }

  var stream = gulp.src(src)
    .pipe($.sass());

  if (distribution) {
    stream = stream
      .pipe($.concat('application.css'))
      .pipe($.minifyCss());
  }

  stream = stream
    .pipe(gulp.dest(paths('dest.app.styles', opts)))
    .pipe($.livereload(lr));

  return stream;
};

tasks['.static:app'] = function(options) {
  var opts = options || {};
  var env = opts.env || 'development';
  var context = { GULP_ENVIRONMENT: env };
  var distribution = (env === 'distribution');
  var htmlFilter = $.filter(['**/*.{html,htm}']);
  var imageFilter = $.filter(['**/*.{png,jpg,jpeg,gif,svg}']);
  var stream = gulp.src(paths('src.app.static', opts));
  if (distribution) {
    stream = stream
      .pipe(htmlFilter)
      .pipe($.preprocess({ context: context }))
      .pipe($.htmlmin({ removeComments: true, collapseWhitespace: true }))
      .pipe(htmlFilter.restore())
      .pipe(imageFilter)
      .pipe($.imagemin({}))
      .pipe(imageFilter.restore())
      .pipe(gulp.dest(paths('dest.app.static', opts)));
  }
  return stream.pipe($.livereload(lr));
};

tasks['.test:app'] = function(options) {
  var opts = options || {};
  var env = opts.env || 'development';
  var distribution = (env === 'distribution');
  if (distribution) {
    throw new Error('Tests can not (currently) be run for distribution.');
  }

  var dir = paths('dest.app.scripts', opts);
  var vendor = [
    path.join(dir, 'vendor.js'),
  ];
  var app = [
    path.join(dir, 'templates.js'),
    path.join(dir, 'application.js')
  ];

  var sources = [].concat(vendor,
    paths('src.app.tests.fixtures', opts),
    paths('src.app.tests.helpers', opts), app,
    paths('src.app.tests', opts));
  return gulp.src(sources)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: (distribution ? 'run' : 'watch')
    }));
};

tasks['.clean'] = function(options) {
  var opts = options || {};
  return gulp.src(paths('dest.root', opts), { read: false })
    .pipe($.clean());
};


/*
 * Private Tasks
 */

gulp.task('.static:app:dev', function() {
  return tasks['.static:app'](environment('development'));
});

gulp.task('.static:app:dist', function() {
  return tasks['.static:app'](environment('distribution'));
});

gulp.task('.styles:app:dev', function() {
  return tasks['.styles:app'](_.merge(environment('development'), { all: true }));
});

gulp.task('.styles:app:dev:update', function() {
  return tasks['.styles:app'](_.merge(environment('development'), { styles: true }));
});

gulp.task('.styles:app:dist', function() {
  return tasks['.styles:app'](_.merge(environment('distribution'), { all: true }));
});

gulp.task('.scripts:app:dev', function() {
  return tasks['.scripts:app'](_.merge(environment('development'), { all: true }));
});

gulp.task('.scripts:app:dev:update', function() {
  return tasks['.scripts:app'](_.merge(environment('development'), { scripts: true }));
});

gulp.task('.scripts:app:dev:update-templates', function() {
  return tasks['.scripts:app'](_.merge(environment('development'), { templates: true }));
});

gulp.task('.scripts:app:dist', function() {
  return tasks['.scripts:app'](_.merge(environment('distribution'), { all: true }));
});

gulp.task('.build:app:dev', [
  '.static:app:dev',
  '.styles:app:dev',
  '.scripts:app:dev'
]);

gulp.task('.build:app:dist', [
  '.static:app:dist',
  '.styles:app:dist',
  '.scripts:app:dist'
]);

gulp.task('.watch:app:dev', function() {
  return tasks['.watch']({ app: true });
});

gulp.task('.watch:test:app', function() {
  return tasks['.watch']({ app: true, testing: true });
});

gulp.task('.test:app:dev', ['.build:app:dev', '.watch:test:app'], function() {
  return tasks['.test:app'](environment('development'));
});

gulp.task('.serve:dev', ['.build:app:dev', '.watch:app:dev'], function() {
  return tasks['.serve'](environment('development'));
});

gulp.task('.clean:dev', function() {
  return tasks['.clean'](environment('development'));
});

gulp.task('.clean:dist', function() {
  return tasks['.clean'](environment('distribution'));
});


/*
 * Public Tasks
 */

gulp.task('default', ['build']);

gulp.task('serve', ['.clean:dev'], function() {
  gulp.start('lint', '.serve:dev');
});

gulp.task('serve:dist', ['.clean:dist'], function() {
  gulp.start('lint', '.serve:dist');
});

gulp.task('test', ['.clean:dev'], function() {
  gulp.start('lint', '.test:app:dev');
});

gulp.task('test:app', ['.clean:dev'], function() {
  gulp.start('lint', '.test:app:dev');
});

gulp.task('build', ['.clean:dist'], function() {
  gulp.start('lint', '.build:app:dist');
});

gulp.task('lint', function() {
  var src = [].concat(
    paths('src.project.scripts'),
    paths('src.app.scripts'),
    paths('src.app.tests'));
  return gulp.src(src)
    .pipe($.cached('linting'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});

gulp.task('clean', ['.clean:dev']);
gulp.task('clean:dist', ['.clean:dist']);

