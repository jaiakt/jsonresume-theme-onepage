var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

COURSES_COLUMNS = 2;

PREPEND_SUMMARY_CATEGORIES = [
  'work',
  'volunteer',
  'awards',
  'publications'
];

function validateArray(arr) {
  return arr !== undefined && arr !== null && arr instanceof Array && arr.length > 0;
}

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", 
               "Oct", "Nov", "Dec"];

function render(resume) {
  // Split courses into 3 columns
  if (validateArray(resume.education)) {
    resume.education.forEach(function(block) {
      if (validateArray(block.courses)) {
        splitCourses = [];
        columnIndex = 0;
        for (var i = 0; i < COURSES_COLUMNS; i++) {
          splitCourses.push([]);
        }
        block.courses.forEach(function(course) {
          splitCourses[columnIndex].push(course);
          columnIndex++;
          if (columnIndex >= COURSES_COLUMNS) {
            columnIndex = 0;
          }
        });
        block.courses = splitCourses;
      }
    });
  }

  PREPEND_SUMMARY_CATEGORIES.forEach(function(category) {
    if (resume[category] !== undefined) {
      resume[category].forEach(function(block) {
        if (block.highlights === undefined) {
          block.highlights = [];
        }
        if (block.summary) {
          block.highlights.unshift(block.summary);
          delete block.summary;
        }
      });
    }
  });

  function parseDate(date) {
    var d = new Date(date)
    return new Handlebars.SafeString(MONTH_NAMES[d.getUTCMonth()] + ' ' + d.getFullYear());
  }
  Handlebars.registerHelper('parseDate', parseDate);

	var css = fs.readFileSync(__dirname + '/style.css', 'utf-8');
	var tpl = fs.readFileSync(__dirname + '/resume.hbs', 'utf-8');
  var partialsDir = path.join(__dirname, 'partials');
  var filenames = fs.readdirSync(partialsDir);

  filenames.forEach(function(filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    var name = matches[1];
    var filepath = path.join(partialsDir, filename)
    var template = fs.readFileSync(filepath, 'utf8');

    Handlebars.registerPartial(name, template);
  });

	return Handlebars.compile(tpl)({
		css: css,
		resume: resume
	});
}

module.exports = {
	render: render
};
