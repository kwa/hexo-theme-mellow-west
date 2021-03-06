const { version, name } = require('../package.json')

hexo.extend.helper.register('theme_version', () => version)

const source = (path, cache, ext) => {
    if (cache) {
        const minFile = `${path + ext}`
        return hexo.theme.config.cdn ? `//unpkg.com/${name}@latest${minFile}` : `${minFile}?v=${version}`
    } else {
        return path + ext
    }
}
hexo.extend.helper.register('theme_js', (path, cache) => source(path, cache, '.js'))
hexo.extend.helper.register('theme_css', (path, cache) => source(path, cache, '.css'))

hexo.extend.tag.register('image', ([src, alt = '', title = '', imgClass = '']) => {
    return `<figure class="image-box">
                <img src="${src}" alt="${alt}" title="${title}" class="${imgClass}">
                <p>${title || alt}</p>
            </figure>`;
});

hexo.extend.filter.register('before_post_render', data => {
    // Code block containing images <escape>[\s\S]*\!\[(.*)\]\((.+)\)[\s\S]*<\/escape>
    // Inline image [^`]\s*\!\[(.*)\]\((.+)\)([^`]|$)
    data.content = data.content.replace(/<escape>.*\!\[(.*)\]\((.+)\).*<\/escape>|([^`]\s*|^)\!\[(.*)\]\((.+)\)([^`]|$)/gm, match => {

        // Ignore images in code blocks
        if (/<escape>[\s\S]*<\/escape>|.?\s{3,}/.test(match)) {
            return match;
        }

        return match.replace(/\!\[(.*)\]\((.+)\)/, (img, alt, src) => {
            const attrs = src.split(' ');
            const title = (attrs[1] && attrs[1].replace(/\"|\'/g, '')) || '';
            return `{% image ${attrs[0]} '${alt}' '${title}' %}`
        })
    });

    //Delete illegal characters of xml
    data.content = data.content.replace(/[\x00-\x08]|[\x0B-\x0C]|[\x0E-\x1F]/g, "");
    return data;
});
