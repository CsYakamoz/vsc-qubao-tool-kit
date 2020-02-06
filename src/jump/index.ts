import {
    TextDocument,
    Position,
    CancellationToken,
    ProviderResult,
    Location,
    LocationLink,
    Uri
} from 'vscode';
import { getFolder } from '../utility';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';

const pattern = /(Service|Core)\s*(\.\w+\s*)+/;

export default function jump(
    document: TextDocument,
    position: Position,
    token: CancellationToken
): ProviderResult<Location | Location[] | LocationLink[]> {
    const paragraph = document.getText(
        document.getWordRangeAtPosition(position, pattern)
    );
    if (!pattern.test(paragraph)) {
        return;
    }

    const clickWord = document.getText(
        document.getWordRangeAtPosition(position)
    );
    const wordList = paragraph.split('.');

    if (wordList[0] === 'Core') {
        return;
    }

    // 非最后一个词(动词), 则忽略
    if (clickWord !== wordList[wordList.length - 1]) {
        return;
    }

    if (wordList[2] !== 'Model') {
        return api(wordList, clickWord);
    } else if (wordList[2] === 'Model') {
        return model(wordList, clickWord);
    }
}

function api(
    wordList: string[],
    clickWord: string
): ProviderResult<Location | Location[] | LocationLink[]> {
    const schemaDir = path.join(
        getFolder(),
        wordList[0].toLowerCase(),
        camelCaseToUnderscore(wordList[1]),
        'schema'
    );
    if (!fs.existsSync(schemaDir)) {
        return;
    }

    const reg = clickWord.replace(
        /[A-Z]/g,
        c => '[\\\\.\\\\-_]' + c.toLowerCase()
    );
    const command = `find ${schemaDir} -type f | grep -E '${reg}'`;

    try {
        const list = find(command);

        return list.map(
            file => new Location(Uri.file(file), new Position(0, 0))
        );
    } catch (error) {
        return;
    }
}

function model(
    wordList: string[],
    clickWord: string
): ProviderResult<Location | Location[] | LocationLink[]> {
    const modelDir = path.join(
        getFolder(),
        wordList[0].toLowerCase(),
        camelCaseToUnderscore(wordList[1]),
        'model'
    );
    if (!fs.existsSync(modelDir)) {
        return;
    }

    const modelList = wordList[3]
        .replace(/[A-Z]/g, c => '^' + c.toLowerCase())
        .split('^')
        .filter(_ => _ !== '');

    const objectList = isObject(modelDir, modelList);
    const relationList = isRelation(modelDir, modelList);
    const list = objectList.concat(relationList);
    return list.map(file => new Location(Uri.file(file), new Position(0, 0)));
}

function isObject(modelDir: string, modelList: string[]) {
    const fileName = modelList.join('[\\\\.\\\\-_]');
    const command = `find ${modelDir}/object/schema -type f | grep -E '${fileName}'`;
    try {
        return find(command);
    } catch (error) {
        return [];
    }
}

function isRelation(modelDir: string, modelList: string[]) {
    const fileName = modelList.join('[\\\\.\\\\-_/]');
    const command = `find ${modelDir}/relation/schema -type f | grep -E '${fileName}'`;
    try {
        return find(command);
    } catch (error) {
        return [];
    }
}

// Notice: 如果相关命令未有任何输出, execSync 会认为是错误
function find(command: string) {
    return childProcess
        .execSync(command)
        .toString()
        .split('\n')
        .filter(_ => _ !== '');
}

function camelCaseToUnderscore(camelCase: string) {
    return camelCase
        .replace(/[A-Z]/g, c => '^' + c.toLowerCase())
        .split('^')
        .filter(_ => _ !== '')
        .join('_');
}
