import { Pipe, PipeTransform } from '@angular/core';

declare var emojify: any;

@Pipe({
  name: 'emojify'
})
export class EmojifyPipe implements PipeTransform {

  private static initialized = false;

  transform(value: string, args?: any): string {
    if (!EmojifyPipe.initialized) {
      emojify.setConfig({
        mode: 'data-uri'
      });
      EmojifyPipe.initialized = true;
    }
    return emojify.replace(value);
  }

}

export const emojis: string[] = [
  ':smile:',
  ':laughing:',
  ':blush:',
  ':smiley:',
  ':relaxed:',
  ':smirk:',
  ':heart_eyes:',
  ':kissing_heart:',
  ':kissing_closed_eyes:',
  ':flushed:',
  ':relieved:',
  ':satisfied:',
  ':grin:',
  ':wink:',
  ':stuck_out_tongue_winking_eye:',
  ':stuck_out_tongue_closed_eyes:',
  ':grinning:',
  ':kissing:',
  ':kissing_smiling_eyes:',
  ':stuck_out_tongue:',
  ':sleeping:',
  ':worried:',
  ':frowning:',
  ':anguished:',
  ':open_mouth:',
  ':grimacing:',
  ':confused:',
  ':hushed:',
  ':expressionless:',
  ':unamused:',
  ':sweat_smile:',
  ':sweat:',
  ':disappointed_relieved:',
  ':weary:',
  ':pensive:',
  ':disappointed:',
  ':confounded:',
  ':fearful:',
  ':cold_sweat:',
  ':persevere:',
  ':cry:',
  ':sob:',
  ':joy:',
  ':astonished:',
  ':scream:',
  ':neckbeard:',
  ':tired_face:',
  ':angry:',
  ':rage:',
  ':triumph:',
  ':sleepy:',
  ':yum:',
  ':mask:',
  ':sunglasses:',
  ':dizzy_face:',
  ':neutral_face:',
  ':no_mouth:',
  ':innocent:',
  ':heart:',
  ':broken_heart:',
  ':star:',
  ':thumbsup:',
  ':thumbsdown:',
  ':ok_hand:',
  ':punch:',
  ':fist:',
  ':v:',
  ':wave:',
  ':hand:',
  ':open_hands:',
  ':point_up:',
  ':point_down:',
  ':point_left:',
  ':point_right:',
  ':raised_hands:',
  ':pray:',
  ':point_up_2:',
  ':clap:',
  ':muscle:',
  ':metal:',
];

