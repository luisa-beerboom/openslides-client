import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { OperatorService } from 'src/app/site/services/operator.service';

import { CmlPermsDirective } from './cml-perms.directive';
import { BasePermsTestComponent } from './perms.directive.spec';

type TestConditionalType = {
    and: boolean;
    or: boolean;
    complement: boolean;
    id: number;
    nonAdmin: boolean;
    orOML: OML | undefined;
};

@Component({
    template: `
        <div
            *osCmlPerms="permission; committeeId: conditionals.id; nonAdminCheck: conditionals.nonAdmin"
            id="normal"
        ></div>
        <div *osCmlPerms="permission; committeeId: conditionals.id; or: conditionals.or" id="or"></div>
        <div *osCmlPerms="permission; committeeId: conditionals.id; and: conditionals.and" id="and"></div>
        <div
            *osCmlPerms="permission; committeeId: conditionals.id; complement: conditionals.complement"
            id="complement"
        ></div>
        <div *osCmlPerms="permission; committeeId: conditionals.id; orOML: conditionals.orOML" id="oml"></div>
    `
})
class TestComponent extends BasePermsTestComponent<TestConditionalType> {
    public permission = CML.can_manage;
    public constructor() {
        super({ and: true, or: true, complement: true, id: 1, nonAdmin: false, orOML: undefined });
    }
}

class MockOperatorService {
    public get operatorUpdated(): Observable<void> {
        return this._operatorUpdatedSubject;
    }

    private _operatorUpdatedSubject = new Subject<void>();
    private _permList: CML[] = [];
    private _oml: OML | undefined = undefined;
    private _isAdmin = false;

    public hasOrganizationPermissions(...checkPerms: OML[]): boolean {
        return checkPerms.some(perm => perm === this._oml);
    }

    public hasCommitteePermissions(committeeId: Id | null, ...checkPerms: CML[]): boolean {
        return this._isAdmin || this.hasCommitteePermissionsNonAdminCheck(committeeId, ...checkPerms);
    }

    public hasCommitteePermissionsNonAdminCheck(committeeId: Id | null, ...checkPerms: CML[]): boolean {
        return checkPerms.some(perm => this._permList.includes(perm));
    }

    public changeOperatorPermsForTest(newPermList: CML[], oml?: OML | undefined): void {
        this._permList = newPermList;
        if (oml) {
            this._isAdmin = oml === OML.superadmin;
        }
        this._oml = oml;
        this._operatorUpdatedSubject.next();
    }
}

describe(`CmlPermsDirective`, () => {
    let fixture: ComponentFixture<TestComponent>;
    let operatorService: MockOperatorService;
    const update = () => {
        fixture.detectChanges();
        jasmine.clock().tick(100000);
    };
    const getElement = (css: string) => fixture.debugElement.query(By.css(css));

    beforeEach(() => {
        jasmine.clock().install();
        fixture = TestBed.configureTestingModule({
            declarations: [CmlPermsDirective, TestComponent],
            providers: [CmlPermsDirective, { provide: OperatorService, useClass: MockOperatorService }]
        }).createComponent(TestComponent);

        operatorService = TestBed.inject(OperatorService) as unknown as MockOperatorService;
        update();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`check if element gets restricted`, async () => {
        expect(getElement(`#normal`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([]);
        update();
        expect(getElement(`#normal`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage], OML.superadmin);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([], OML.superadmin);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
    });

    it(`check if element gets restricted with non-admin-check`, async () => {
        fixture.componentInstance.setTestComponentData({ nonAdmin: true });
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([]);
        update();
        expect(getElement(`#normal`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage], OML.superadmin);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([], OML.superadmin);
        update();
        expect(getElement(`#normal`)).toBeFalsy();
    });

    it(`check if or condition works`, async () => {
        expect(getElement(`#or`)).toBeTruthy();
        fixture.componentInstance.setTestComponentData({ or: false });
        update();
        expect(getElement(`#or`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#or`)).toBeTruthy();
        fixture.componentInstance.setTestComponentData({ or: true });
        update();
        expect(getElement(`#or`)).toBeTruthy();
    });

    it(`check if and condition works`, async () => {
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.setTestComponentData({ and: false });
        update();
        expect(getElement(`#and`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.setTestComponentData({ and: true });
        update();
        expect(getElement(`#and`)).toBeTruthy();
    });

    it(`check if complement works`, async () => {
        expect(getElement(`#complement`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#complement`)).toBeFalsy();
    });

    it(`check what happens if there's no committee id`, async () => {
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        fixture.componentInstance.setTestComponentData({ id: undefined });
        update();
        expect(getElement(`#normal`)).toBeFalsy();
    });

    it(`check if orOML works`, async () => {
        operatorService.changeOperatorPermsForTest([], OML.can_manage_organization);
        update();
        expect(getElement(`#oml`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([], undefined);
        fixture.componentInstance.setTestComponentData({ orOML: OML.can_manage_users });
        update();
        expect(getElement(`#oml`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([CML.can_manage]);
        update();
        expect(getElement(`#oml`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([CML.can_manage], OML.can_manage_users);
        update();
        expect(getElement(`#oml`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([], OML.can_manage_users);
        update();
        expect(getElement(`#oml`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([], OML.can_manage_organization);
        update();
        expect(getElement(`#oml`)).toBeFalsy();
    });
});
