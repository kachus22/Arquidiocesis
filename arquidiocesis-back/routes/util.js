/**
 * Module that contains utilities for exporting to csv
 * @module Util
 */
const Readable = require('stream').Readable;
const iconv = require('iconv-lite');
const xlsx = require('xlsx');
const WebPushNotifications = require('../WebPushNotifications');

/**
 * Turns data to CSV
 * @param {Array<String>} header  - contains all the headers for the columns
 * @param {Array<String>} values  - Conains all the values for each row
 */
function toCSV(header, values) {
  const csv =
    header.join(',') +
    '\n' +
    values
      .map((a) =>
        a
          .map((a) => {
            if (typeof a === 'string') {
              return '"' + a + '"';
            } else return a;
          })
          .join(',')
      )
      .join('\n');
  const stream = new Readable();
  stream.setEncoding('UTF8');
  stream.push(Buffer.from(csv, 'utf8'));
  stream.push(null);

  return stream.pipe(iconv.encodeStream('utf16le'));
}

function toXLS(header, values) {
  const book = xlsx.utils.book_new();
  const sheet = xlsx.utils.aoa_to_sheet([header, ...values]);
  xlsx.utils.book_append_sheet(book, sheet, 'sheet1');
  const buf = xlsx.write(book, { type: 'buffer', bookType: 'xls' });
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);

  return stream;
}

function toXLS2sheets(header1, values1, header2, values2) {
  const book = xlsx.utils.book_new();
  const sheet1 = xlsx.utils.aoa_to_sheet([header1, ...values1]);
  xlsx.utils.book_append_sheet(book, sheet1, 'sheet1');
  const sheet2 = xlsx.utils.aoa_to_sheet([header2, ...values2]);
  xlsx.utils.book_append_sheet(book, sheet2, 'sheet2');
  const buf = xlsx.write(book, { type: 'buffer', bookType: 'xls' });
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);

  return stream;
}

/**
 * Flatten an object, used to generate the XLS
 * https://stackoverflow.com/a/53739792
 * @param {Object} ob Object to flatten
 */
function flattenObject(ob) {
  const toReturn = {};
  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) {
      continue;
    }
    if (typeof ob[i] == 'object' && ob[i] !== null) {
      const flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) {
          continue;
        }

        toReturn[i === x ? i : i + '_' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

// this function will be triggered by any db update.
async function triggerNotification(ids, title, path, message) {
  try {
    await Promise.all(
      ids.map((id) =>
        WebPushNotifications.sendToUserByID(id, {
          title,
          body: message,
          data: {
            path,
          },
        })
      )
    );
  } catch (e) {
    console.log(`Unexpected error in triggerNotification: ${e}`);
  }
}

module.exports = {
  toCSV,
  toXLS,
  toXLS2sheets,
  flattenObject,
  triggerNotification,
};
