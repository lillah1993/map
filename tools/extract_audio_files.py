import os
import shutil
import requests
import subprocess
import time

from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.AudioClip import CompositeAudioClip
import moviepy.audio.fx.all as afx
import moviepy.editor as editor

APIKEY = os.environ['AIRTABLE_APIKEY']
BASE = 'appfJRhs6ZsWF5OtU'
AIRTABLE = 'https://api.airtable.com/v0'
FILENAME = 'asset.mp4'
OUTDIR = 'm3-assets'


def fetch(table, rid=None):
    if rid is None:
        ret = requests.get(f'{AIRTABLE}/{BASE}/{table}?view=website', headers=dict(Authorization=f'Bearer {APIKEY}')).json()
        return [dict(**r['fields'], __id=r['id']) for r in ret['records']]
    else:
        ret = requests.get(f'{AIRTABLE}/{BASE}/{table}/{rid}', headers=dict(Authorization=f'Bearer {APIKEY}')).json()
        return ret['fields']

if __name__ == '__main__':
    os.makedirs(OUTDIR, exist_ok=True)
    asset_filename = os.path.join(OUTDIR, FILENAME)
    if not os.path.exists(asset_filename):
        assets = fetch('Assets')
        asset = assets[0]['Attachments'][0]['url']
        with open(asset_filename, 'wb') as dst:
            src = requests.get(asset, stream=True).raw
            shutil.copyfileobj(src, dst)

    a = VideoFileClip(asset_filename).audio

    segments = fetch('Segment')
    for segment in segments:
        out_filename = os.path.join(OUTDIR, f"{segment['title']}.mp3")
        timestamps = [fetch('Audio Editing', rid) for rid in segment['audio_editing']]
        timestamps = [t for t in timestamps if t['length']]
        clips = []
        for timestamp in timestamps:
            clip = a.copy()
            clip = clip.subclip(timestamp['start'], timestamp['end'])
            clip = clip.fx( afx.audio_fadein, 0.5).fx( afx.audio_fadeout, 0.5)
            clips.append(clip)
        clip = editor.concatenate_audioclips(clips)
        clip.write_audiofile(out_filename)
        segment['duration'] = clip.duration
        print(segment['duration'])
        
    subprocess.run('git add m3-assets', shell=True)
    subprocess.run('git status', shell=True)
    subprocess.run('git commit -m "Update M3 sound assets"', shell=True)
    subprocess.run('git push', shell=True)

    cb = str(time.time())

    for segment in segments:
        url = f'https://raw.githubusercontent.com/akariv/atlas-medliq/master/m3-assets/{segment["title"]}.mp3#{cb}'
        null_request = dict(
            records=[dict(
                id=segment['__id'],
                fields=dict(
                    audio=[],
                    duration=0
                )
            )]
        )
        full_request = dict(
            records=[dict(
                id=segment['__id'],
                fields=dict(
                    audio=[dict(
                        url=url
                    )],
                    duration=float(segment['duration'])
                )
            )]
        )
        resp = requests.patch('https://api.airtable.com/v0/appfJRhs6ZsWF5OtU/Segment',
                            json=null_request, 
                            headers=dict(Authorization=f'Bearer {APIKEY}'))
        resp = requests.patch('https://api.airtable.com/v0/appfJRhs6ZsWF5OtU/Segment',
                            json=full_request, 
                            headers=dict(Authorization=f'Bearer {APIKEY}'))
        print(resp.json()['records'][0]['fields']['audio'][0])
