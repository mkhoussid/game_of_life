const setAttributes = ({ node, attributes }) =>
	attributes.forEach(([name, value]) => {
		node.setAttribute(name, value);
	});

const generateStyle = (styles) => Object.entries(styles).reduce((acc, [name, value]) => `${acc};${name}:${value}`, '');
