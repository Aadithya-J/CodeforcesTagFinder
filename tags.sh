#!/bin/bash

NODE_FILE="/Users/aadithya/Developer/CodeForcesTagFinder/app.cjs"
OUT_FILE="/Users/aadithya/Developer/CodeForcesTagFinder/out.txt"

if [[ -f $NODE_FILE ]]; then
    echo "Running codeforces tag finder"

    node $NODE_FILE

    if [[ -f $OUT_FILE ]]; then
        echo "Contents of out.txt:"
        cat $OUT_FILE
    else
        echo "Error: out.txt not found"
    fi
else
    echo "Error: Node.js file '$NODE_FILE' not found"
fi

