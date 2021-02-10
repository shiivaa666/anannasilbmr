const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');


const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping tamamdır.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);



client.on("ready", () => {
  let sesegir = ayarlar.botses
  client.channels.cache.get(sesegir).join();
  });    

client.on('message', msg => {
  let tag = ayarlar.tag
  if (msg.content.toLowerCase() === 'tag') {
    msg.channel.send(` \`${tag}\` `);
  }
});

client.on('message', msg => {
    let tag = ayarlar.tag
  if (msg.content.toLowerCase() === '.tag') {
    msg.channel.send(` \`${tag}\` `);
  }
});

client.on('message', msg => {
    let tag = ayarlar.tag
  if (msg.content.toLowerCase() === '!tag') {
    msg.channel.send(` \`${tag}\` `);
  }
});

client.on("messageUpdate", async (oldMsg, newMsg) => {
let wictor = await db.fetch(`pekabot_${oldMsg.channel.id}`)
if (!wictor) return 
if(!newMsg.guild) return;
let küfürler = require('./küfürler.json')
let kelimeler = newMsg.content.slice(" ").split(/ +/g)
if(küfürler.some(kufur => kelimeler.some(kelime => kelime === kufur))) {
if (newMsg.member.hasPermission("MANAGE_MESSAGES")) return;
newMsg.delete()
oldMsg.reply('Bi sen zekisin!').then(msg => msg.delete(5000)) 
}
});
////////////////////////////////////////////////////////CAPS LOCK///////////////////////////////////////////////////
    client.on("message", async msg => {
    if (msg.channel.type === "dm") return;
      if(msg.author.bot) return;  
        if (msg.content.length > 4) {
         if (db.fetch(`capslock_${msg.guild.id}`)) {
           let caps = msg.content.toUpperCase()
           if (msg.content == caps) {
             if (!msg.member.hasPermission("ADMINISTRATOR")) {
               if (!msg.mentions.users.first()) {
                 msg.delete()
                 return msg.channel.send(`🛑 ${msg.author}, **Bu sunucuda, büyük harf kullanımı engellenmekte!**`)          
     }
       }
     }
   }
  }
});
////////////////////////////////////////////////////////CAPS LOCK///////////////////////////////////////////////////

/////////////////////////////////////////////////////////REKLAM ////////////////////////////////////////////////////

client.on("message", msg => {
  if(!db.has(`reklam_${msg.guild.id}`)) return;
         const reklam = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg",];
         if (reklam.some(word => msg.content.includes(word))) {
           try {
             if (!msg.member.hasPermission("BAN_MEMBERS")) {
                   msg.delete();
                     return msg.channel.send(new Discord.MessageEmbed().setDescription(`${msg.author} Bu sunucuda reklam filtresi etkin.`).setColor('0x800d0d').setAuthor(msg.member.displayName, msg.author.avatarURL({ dynamic: true })).setTimestamp()).then(x => x.delete({timeout: 5000}));
   
  
   msg.delete(3000);                              
  
             }              
           } catch(err) {
             console.log(err);
           }
         }
     });

  ////////////////////////////////////////////////////////REKLAM ///////////////////////////////////////////////////

  ////////////////////////////////////////////////////////A F K ///////////////////////////////////////////////////

  client.on("message" , async msg => {
  
    if(!msg.guild) return;
    if(msg.content.startsWith(ayarlar.prefix+"afk")) return; 
    
    let afk = msg.mentions.users.first()
    
    const kisi = db.fetch(`afkid_${msg.author.id}_${msg.guild.id}`)
    
    const isim = db.fetch(`afkAd_${msg.author.id}_${msg.guild.id}`)
   if(afk){
     const sebep = db.fetch(`afkSebep_${afk.id}_${msg.guild.id}`)
     const kisi3 = db.fetch(`afkid_${afk.id}_${msg.guild.id}`)
     if(msg.content.includes(kisi3)){
  
         msg.reply(`Etiketlediğiniz kişi **${sebep}** sebebinden AFK!`)
     }
   }
    if(msg.author.id === kisi){
  
         msg.reply(`AFK Modundan başarıyla çıkış yaptınız.`)
     db.delete(`afkSebep_${msg.author.id}_${msg.guild.id}`)
     db.delete(`afkid_${msg.author.id}_${msg.guild.id}`)
     db.delete(`afkAd_${msg.author.id}_${msg.guild.id}`)
      msg.member.setNickname(isim)
      
    }  ////////////////////////////////////////////////////////A F K ///////////////////////////////////////////////////


 ////////////////////////////////////////////////////////SA-AS ///////////////////////////////////////////////////

 client.on('message', async msg => { 
  if (msg.content.toLowerCase() === 'sa') { 
  await msg.react('🇦'); 
  msg.react('🇸'); 
  } 
  });
  
  client.on('message', async msg => { 
  if (msg.content.toLowerCase() === 'selam') { 
  await msg.react('🇦'); 
  msg.react('🇸'); 
  } 
  }); 
  
  client.on('message', async msg => { 
  if (msg.content.toLowerCase() === 'selamın aleyküm') { 
  await msg.react('🇦'); 
  msg.react('🇸'); 
  } 
  }); 

  client.on('message', async msg => { 
    if (msg.content.toLowerCase() === 'sea') { 
    await msg.react('🇦'); 
    msg.react('🇸'); 
    } 
    }); 
  client.on('message', async msg => { 
  if (msg.content.toLowerCase() === 'selamun aleyküm') { 
  await msg.react('🇦'); 
  msg.react('🇸'); 
  } 
  });

   ////////////////////////////////////////////////////////SA-AS ///////////////////////////////////////////////////

  //////////////////////////////////////////////////////// ETİKET ///////////////////////////////////////////////////

  client.on('message', async message => {
    let prefix = db.fetch(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix
     await db.fetch(`prefix.${message.guild.id}`) 
     if(message.content == `<@!804015978656563232>`) return message.channel.send(`**Sanırım beni etiketlediniz.**\n Bu SunucudakiPrefix'im : \`${prefix}\``);
   })
//////////////////////////////////////////////////////// ETİKET ///////////////////////////////////////////////////

//////////////////////////////////////////////////////// OTOROL ///////////////////////////////////////////////////
client.on('guildMemberAdd', async member => {
  
  let kanal1 = await db.fetch(`otorolkanal_${member.guild.id}`);
  let kanal2 = member.guild.channels.cache.get(kanal1)
  
  let rol1 = await db.fetch(`otorolrol_${member.guild.id}`);
  let rol2 = member.guild.roles.cache.get(rol1)
  
  if (!kanal2) return;
  if (!rol2) return;
    
  const embed = new Discord.MessageEmbed()
    
  .setColor("#2059BC")
  
  .setDescription(`Sunucuya Katılan **${member}** Adlı Kullanıcıya Başarıyla \**${rol2.name}\** Rolü Verildi.`)
  
  kanal2.send(embed)
    
  member.roles.add(rol2)
  });
//////////////////////////////////////////////////////// OTOROL ///////////////////////////////////////////////////

  //////////////////////////////////////////////////////// NİCK ///////////////////////////////////////////////////
const data = require('quick.db');
const logs = require('discord-logs');
logs(client);
client.on('guildMemberNicknameUpdate', async (member, oldNickname, newNickname) => require('quick.db').push(`harmanim.baba.nerdee.carsafim.${member.user.id}.${member.guild.id}`, { isimler: `${oldNickname ? oldNickname : member.user.username} -> ${newNickname ? newNickname : member.user.username}` }));

  //////////////////////////////////////////////////////// NİCK ///////////////////////////////////////////////////


});