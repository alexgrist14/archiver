const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// Функция для проверки, была ли папка создана после указанной даты
function isFolderCreatedAfterDate(folderPath, date) {
  const stats = fs.statSync(folderPath);
  return stats.isDirectory() && stats.birthtime.getTime() > date.getTime();
}

// Функция для создания zip архива из папки
function createZip(folderPath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // уровень сжатия
    });

    output.on("close", function () {
      resolve();
    });

    archive.on("error", function (err) {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

// Функция для удаления папки и её содержимого
function removeFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

// Основная функция для обработки массива папок
async function processFolders(folders) {
  const cutoffDate = new Date("2024-01-01");

  for (const folder of folders) {
    const subFolders = fs
      .readdirSync(folder)
      .map((name) => path.join(folder, name))
      .filter((subFolderPath) =>
        isFolderCreatedAfterDate(subFolderPath, cutoffDate)
      );

    for (const subFolder of subFolders) {
      const zipName = `${subFolder}.zip`;
      await createZip(subFolder, zipName);
      removeFolderRecursive(subFolder);
      console.log(
        `Папка ${subFolder} успешно сконвертирована в архив и удалена.`
      );
    }
  }
}

// Пример использования
const foldersToProcess = [
  "E:/Packs/Manga/Milf/Tanishi/New",
  "E:/Packs/Manga/Milf/Akikusa",
  "E:/Packs/Manga/Milf/Amarsroshta",
  "E:/Packs/Manga/Milf/Chachamaru",
  "E:/Packs/Manga/Milf/Emori Uki",
  "E:/Packs/Manga/Milf/Gin Eiji",
  "E:/Packs/Manga/Milf/Gonza",
  "E:/Packs/Manga/Milf/Hiatoku Sensei",
  "E:/Packs/Manga/Milf/Horsetail",
  "E:/Packs/Manga/Milf/Hyji",
  "E:/Packs/Manga/Milf/Jirou",
  "E:/Packs/Manga/Milf/Jitsuma",
  "E:/Packs/Manga/Milf/Kawaisaw",
  "E:/Packs/Manga/Milf/Lemon cake",
  "E:/Packs/Manga/Milf/Morrow",
  "E:/Packs/Manga/Milf/Natsu no oyatsu",
  "E:/Packs/Manga/Milf/Oozora Kaiko",
  "E:/Packs/Manga/Milf/Orutoro",
  "E:/Packs/Manga/Milf/Ozy",
  "E:/Packs/Manga/Milf/Penguindou",
  "E:/Packs/Manga/Milf/Takashi",
  "E:/Packs/Manga/Milf/Tsuzuru/New",
  "E:/Packs/Manga/Milf/Yokoyama Lynch",
  "E:/Packs/Manga/Milf/Zenmai Kourogi",
];

processFolders(foldersToProcess)
  .then(() => {
    console.log("Все папки успешно обработаны.");
  })
  .catch((err) => {
    console.error("Произошла ошибка:", err);
  });
