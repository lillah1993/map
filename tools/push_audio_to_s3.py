import os
import requests
import boto3
import tempfile
import shutil
from s3transfer import TransferConfig, S3Transfer

APIKEY = os.environ['AIRTABLE_APIKEY']
BUCKET = os.environ['BUCKET_NAME']
ACCESS_KEY = os.environ['ACCESS_KEY']
SECRET_KEY = os.environ['SECRET_KEY']
API_ENDPOINT = 'https://storage.googleapis.com'

BASE_M1 = 'app4j8ReBz6mg40Al'
BASE_M2 = 'appk4QxOhg2XleeTM'
BASE_M3 = 'appfJRhs6ZsWF5OtU'
AIRTABLE = 'https://api.airtable.com/v0'

SUFFIX = '_s3url'

s3_client = boto3.client('s3', region_name='eu', endpoint_url=API_ENDPOINT,
                         aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)


def fetch(base, table):
    ret = requests.get(f'{AIRTABLE}/{base}/{table}?view=website', headers=dict(Authorization=f'Bearer {APIKEY}')).json()
    return [(r['id'], r['fields']) for r in ret['records']]

def patch(base, table, rid, update):
    request = dict(
        records=[dict(
            id=rid,
            fields=update
        )]
    )
    # print('will patch', base, table, rid, update)
    requests.patch(f'{AIRTABLE}/{base}/{table}',
                   json=request, 
                   headers=dict(Authorization=f'Bearer {APIKEY}'))
    # assert False

def get_s3_url(base, table, rid, url, mimetype):
    filename = os.path.basename(url)
    path = f'{base}/{table}/{rid}/{filename}'
    print('get_s3_url', path, mimetype)
    with tempfile.NamedTemporaryFile() as dst:
        src = requests.get(url, stream=True).raw
        shutil.copyfileobj(src, dst)
        dst.seek(0)
        s3_client.put_object(
            Body=dst,
            Bucket=BUCKET,
            Key=path,
            ContentType=mimetype,
        )
        return f'{API_ENDPOINT}/{BUCKET}/{path}'


def update_all(base, table, fields):
    for rid, rec in fetch(base, table):
        update = dict()
        for field in fields:
            items = rec.get(field)
            if items and len(items):
                item = items[0] or {}
                url = item.get('url')
                mime = item.get('type')
                if url:
                    update[field + SUFFIX] = get_s3_url(base, table, rid, url, mime)
        if len(update):
            patch(base, table, rid, update)


if __name__ == '__main__':
    update_all(BASE_M1, 'Samples', ['audio_above', 'audio_below'])
    update_all(BASE_M2, 'Content', ['audio'])
    update_all(BASE_M3, 'Segment', ['audio'])