export default class AnimatedSearchPlaceholder {
  animatedPhrasesCanceled = false;
  promiseAnimatedPhrases = null;
  typingSpeed = 70;
  delayNextPhrase = 1000;
  phrases = [];
  inputElement = null;
  defaultPlaceholder = null;

  init = (phrases, el, defaultPlaceholder = '') => {
    this.phrases = phrases;
    this.inputElement = el;
    this.defaultPlaceholder = defaultPlaceholder;
  };

  printPhrases = () => {
    const _this = this;
    this.animatedPhrasesCanceled = false;

    this.promiseAnimatedPhrases = Promise.resolve().then(function resolver() {
      return _this.phrases
        .reduce((promise, phrase) => promise.then((_) => _this.printPhrase(phrase)), Promise.resolve())
        .then(() => {
          if (!_this.animatedPhrasesCanceled) {
            _this.printPhrases();
          }
        });
    });
  };

  printPhrase = (phrase) => {
    return new Promise((resolve) => {
      // Clear placeholder before typing next phrase
      // TODO - remove letters

      this.clearPlaceholder(this.inputElement);

      let letters = phrase.split('');
      // For each letter in phrase
      letters.reduce(
        (promise, letter, index) =>
          promise.then((_) => {
            // Resolve promise when all letters are typed
            if (index === letters.length - 1) {
              // Delay before start next phrase "typing"
              if (!this.animatedPhrasesCanceled) {
                setTimeout(resolve, this.delayNextPhrase);
              }
            }

            return this.addToPlaceholder(letter, this.inputElement);
          }),
        Promise.resolve()
      );
    });
  };

  clearPlaceholder = (el) => {
    el.setAttribute('placeholder', '');
  };

  addToPlaceholder = (toAdd, el) => {
    el.setAttribute('placeholder', el.getAttribute('placeholder') + toAdd);
    if (this.animatedPhrasesCanceled) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => setTimeout(resolve, this.typingSpeed));
    }
  };

  cancelPrintPhrases = () => {
    this.animatedPhrasesCanceled = true;
    setTimeout(() => {
      this.inputElement.setAttribute('placeholder', this.defaultPlaceholder);
    }, 50);
    setTimeout(() => {
      this.inputElement.setAttribute('placeholder', this.defaultPlaceholder);
    }, 100);
  };
}
