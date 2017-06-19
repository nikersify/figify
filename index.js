const compiler = require('fig-compiler')
const path = require('path')
const through = require('through2')

const nameGen = require('./util/nameGen')

const EXTENSIONS = ['.fig', '.pug']

module.exports = file => {
	const parsed = path.parse(file)
	const extension = parsed.ext
	const fileName = parsed.name
	const baseName = parsed.base
	const dirName = parsed.dir

	if (EXTENSIONS.indexOf(extension) === -1) return through()

	return through(function (buf, enc, next) {
		const contents = buf.toString('utf8')

		const compiled = compiler(contents, {
			defaultName: nameGen(fileName)
		})

		const exported = (name, str, quoted = true) => {
			const p = 'module.exporteds.' + name + '='
			if (str === null) return p + 'null;'
			else if (quoted) {
				const val = str.split('\n')
					.map(x => ('\'' + x + '\''))
					.join('+\n')
				return p + val + ';'
			}
			else return p + str + ';'
		}

		this.push(compiled.template)
		this.push(exported('template', 'template\n', false))
		this.push(exported('style', compiled.style))
		this.push(exported('name', compiled.name))
		this.push(compiled.script)

		next()
	})
}
