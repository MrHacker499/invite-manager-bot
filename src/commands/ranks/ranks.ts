import {
	Command,
	CommandDecorators,
	Logger,
	logger,
	Message,
	Middleware
} from '@yamdbf/core';

import { IMClient } from '../../client';
import { createEmbed, sendEmbed } from '../../functions/Messaging';
import { checkRoles } from '../../middleware/CheckRoles';
import { ranks } from '../../sequelize';
import { BotCommand, CommandGroup, RP } from '../../types';

const { localize } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<IMClient> {
	@logger('Command') private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'ranks',
			aliases: ['show-ranks', 'showRanks'],
			desc: 'Show all ranks.',
			usage: '<prefix>show-ranks',
			group: CommandGroup.Ranks,
			guildOnly: true
		});
	}

	@using(checkRoles(BotCommand.ranks))
	@using(localize)
	public async action(message: Message, [rp]: [RP]): Promise<any> {
		this._logger.log(
			`${message.guild.name} (${message.author.username}): ${message.content}`
		);

		const rs = await ranks.findAll({
			where: {
				guildId: message.guild.id
			},
			order: ['numInvites'],
			raw: true
		});

		let output = '';

		if (rs.length === 0) {
			message.channel.send(rp.CMD_RANKS_NONE());
		} else {
			rs.forEach(r => {
				output +=
					rp.CMD_RANKS_ENTRY({
						role: r.roleId,
						numInvites: r.numInvites,
						description: r.description ? ': ' + r.description : undefined
					}) + '\n';
			});
			const embed = createEmbed(this.client);
			embed.setTitle(rp.CMD_RANKS_TITLE());
			embed.setDescription(output);

			sendEmbed(message.channel, embed, message.author);
		}
	}
}
