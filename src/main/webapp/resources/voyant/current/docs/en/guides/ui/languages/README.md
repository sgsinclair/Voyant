# Languages

Voyant Tools supports multilingualism in various ways.

## Interface Languages

The user interface of Voyant Tools is available in several languages. By default Voyant Tools will detect the browser's language preferences and present the interface in the first available language (or English if no others are available). The following languages are available (in various stages of completion):

* [Arabic](../?lang=ar)
* [Bosnian](../?lang=bs)
* [Croatian](../?lang=hr)
* [Czech](../?lang=cz)
* [English](../?lang=en)
* [French](../?lang=fr)
* [Hebrew](../?lang=he)
* [Italian](../?lang=it)
* [Japanese](../?lang=ja)
* [Serbian](../?lang=sr)

Note that the interface of Arabic and Hebrew are by default displayed in [right-to-left](https://en.wikipedia.org/wiki/Right-to-left) mode.

You can override the browser language preference in two places:

* on the home screen when you hover over the grey "Add Texts" bar and click the languages icon
* in the default skin when you hover over the top blue "Voyant Tools" bar and click the languages icon

{@img language-icon.png Language Options}

Once you click the language icon a menu will appear with the available languages - select one and hit the confirm button (this will cause Voyant to reload with other existing parameters).

Our sincere gratitude to those who contributed to the [translations](#!/guide/about-section-translations). If you're interested in helping with the translations, please contact us on [Twitter](https://twitter.com/voyanttools) or [GitHub](https://github.com/sgsinclair/Voyant).

## Document Languages

Independently of the interface language, Voyant Tools supports analysis of documents in multiple languages. In fact, in some ways Voyant Tools supports analysis in _any_ language since it mostly operates on character sequences (this wide generic support is an advantage, it's also a disadvantage since there's very little language-specific functionality, such as [part-of-speech tagging](https://en.wikipedia.org/wiki/Part-of-speech_tagging)).

Some limited language-specific handling is built into the document [tokenizer](https://en.wikipedia.org/wiki/Tokenization_(lexical_analysis)), the algorithm that determines what words are. In many languages this can be as simple as looking for letter sequences (interrupted by spaces and punctuation), but in other languages there are breaks between between what might be considered words. In addition to some language-specific awareness (notably for Chinese, Japanese and Korean languages), Voyant does have some [limited options](#!/guide/corpuscreator-section-tokenization) for overriding the default tokenization behaviour. 

An important factor for multilingual support is character encoding of source documents. For many input formats the character encoding is handled by the file type and no special handling is needed (XML, PDF, MS Word, etc.). One notable exception is plain text: Voyant will do its best to guess at the character encoding, but for best results its best to provide plain texts in Unicode (UTF-8).

Some languages use a right-to-left script. If you select the Arabic or Hebrew interface, the text orientation should adjust automatically. It's also possible to use other interface languages and force right-to-left display by specifying the "[rtl=true](../?rtl=true)" as part of the URL.

<div style="text-align: center">
{@img arabic.png Arabic}
A static image of a corpus with the Arabic interface and right-to-left display.
</div>

## Next Steps

* [stopwords](#!/guide/stopwords)
* [explore the tools](#!/guide/tools)
* read [about Voyant Tools](#!/guide/about)