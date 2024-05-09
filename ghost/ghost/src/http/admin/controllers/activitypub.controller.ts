import {
    Controller,
    Param,
    Post,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {Roles} from '../../../common/decorators/permissions.decorator';
import {LocationHeaderInterceptor} from '../../../nestjs/interceptors/location-header.interceptor';
import {AdminAPIAuthentication} from '../../../nestjs/guards/admin-api-authentication.guard';
import {PermissionsGuard} from '../../../nestjs/guards/permissions.guard';
import {ActivityPubService} from '../../../core/activitypub/activitypub.service';

@UseInterceptors(LocationHeaderInterceptor)
@UseGuards(AdminAPIAuthentication, PermissionsGuard)
@Controller('activitypub')
export class ActivityPubController {
    constructor(private readonly activitypub: ActivityPubService) {}

    @Roles([
        'Owner'
    ])
    @Post('follow/:username')
    async follow(@Param('username') username: string): Promise<string[]> {
        await this.activitypub.follow(username);
    }

    async getFollowers(): Promise<string[]> {
        const followers = await this.activitypub.getFollowers();

        return followers;
    }
    async getFollowing(): Promise<string[]> {
        const following = await this.activitypub.getFollowing();

        return following;
    }
}
