## SubPlayer

This is a fork of an Open Source Project, which I had to add additional features as a part of an assignment.
Following is a documentation of how I approached the problem.

## Installation

```shell
npm i
```

## Running it locally

```shell
npm start
```

### Todo

-   [x] Feature to import YouTube video+captions into the player
-   [x] Remove all languages and only keep Indian languages
-   [x] Enable transliteration-based typing for selected language.
-   [x] Store all user inputs in the localStorage to restore it on refresh.
-   [x] Create another pane to the right where the translations will be displayed, and the left pane will display the original (English) captions
-   [x] Both the captions should be in-sync with video
-   [x] Add support for exporting source and translated subtitles separately
-   [x] Instead of the default Japanese video and captions, replace it with some good & short video+captions
-   [x] Remove the Chinese advertisement in the right

#### 1. Feature To import YouTube Video

-   I decided to add a modal popop where user could enter youtube video link to import it. To make the UI clean and smooth I decided to use some of Ant UI components such as modal & dropdowns. This would remove the hassle of reinventing the wheel and allow me to focus more on the functionality part.

-   I decided to make a separate component for "Import From Youtube" modal, so that it can be reused, if required later.

-   When video data is fetched from API the video is ready to play, and the URL is also saved on localStorage to restore the video and subtitles on refresh + subtitles are set accordingly.

-   Since Its a live video from a remote URL, generating waveform for whole video was not feasible, as it would require procesing whole audio, and also that feature was not working on loading local video manually, so I skipped on that part.

#### 2. Remove all languages and only keep Indian languages

-   This was pretty straightforward, as I just had to edit the `languages.json` file.

#### 3. Restore previous video & subtitles from localStorage on refresh.

-   On the initial render I check if the youtube video link is present in localStorage, the video + its subtitles are resored.

#### 4. Create another pane to the right where the translations will be displayed, and the left pane will display the original (English) captions

-   In `Subtitles.js` file, I check from a global state that if subtitles are translated, an addition pane is displayed for the translation.

-   In the two panes, original subtitles are kept intact and are not editable, only translated ones can be edited there.

-   While editing translated subtitles, `react-transliterate` package helps editing translated text. The default styles for the translated suggestions were a bit off, so I tweaked CSS a bit.

-   Since the `currentIndex` prop to both 'original' and 'translated' panes is same, so the highlighting and scrolling for both the panes work out of the box, and hence both the subtitles are kept at sync.

#### 4. Add support for exporting source and translated subtitles separately

-   I decided to add dropdowns to select whether a user wants original or translated subtitles. Since I already installed ant-ui so I used its dropdown, component.

-   I changed the structure of `Sub` class to save original and translated subtitles in same state, so that the new structure looks like:

```
{
    start: ____,
    end: ____,
    text: ____,
    originalText: ____,
}
```

-   We can simply export original and translated subtitles from their respective object properties.

Apart from this there were other minor changes, which were very simple that explaining them here in this documentation would not do any good.
