const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const clog = (el = '') => { console.log(el); }; 

async function get_all() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'codeforces.com',
      path: '/api/problemset.problems'
    };

    https.get(options, (res) => {
      clog('Retrieving all problems...');
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to load page, status code: ${res.statusCode}`));
            return;
          }

          const parsedData = JSON.parse(data);

          if (parsedData.status !== 'OK') {
            reject(new Error(`API response status not OK: ${parsedData.comment}`));
            return;
          }

          resolve(parsedData.result.problems);
        } catch (error) {
          reject(new Error('Failed to parse response as JSON: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(new Error('HTTP request failed: ' + error.message));
    });
  });
}

async function get_problems(lbound, ubound) { 
  try {
    let all_problems = await get_all();

    console.log('Processing problems...');

    let all_filtered = [];
    for (let el of all_problems) {
      if (!el.rating || el.rating < lbound || el.rating > ubound || el.contestId <= 1800 || el.tags.includes("*special"))
        continue;
      all_filtered.push(el);
    }

    let tags_list = new Map();
    for (let ind = 0; ind < all_filtered.length; ind++) {
      for (let tag of all_filtered[ind].tags) {
        let cnt = tags_list.get(tag) || 0;
        tags_list.set(tag, cnt + 1);
      }
    }

    let arr = Array.from(tags_list.entries());
    arr.sort((x, y) => y[1] - x[1]);

    let out_str = 'Tags for rating [' + lbound + ', ' + ubound + ']\n\n';

    out_str += "Problems considered: " + all_filtered.length + "\n\n";

    let cnt = 0;
    for (let el of arr) {
      out_str += ++cnt + ". " + el[0] + ": " + el[1] + '\n';
    }

    const outputPath = path.join(__dirname, 'out.txt');
    fs.writeFile(outputPath, out_str, err => {
      if (err) {
        clog(err);
      } else {
        process.exit(0); 
      }
    });

  } catch (error) {
    clog('Error: ' + error.message);
    process.exit(1); 
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Lower bound rating: ', (lbound) => {
  rl.question('Upper bound rating: ', (ubound) => {
    get_problems(parseInt(lbound), parseInt(ubound));
  });
});
