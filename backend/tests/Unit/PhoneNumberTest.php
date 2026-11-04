<?php

use App\Services\Support\PhoneNumber;

it('normalises accepted Bangladeshi mobile formats', function (string $input) {
    expect(PhoneNumber::normalize($input))->toBe('+8801711949110');
})->with([
    '01711949110',
    '01711-949110',
    '8801711949110',
    '+8801711949110',
    ' +880 1711 949 110 ',
]);

it('rejects invalid numbers', function (?string $input) {
    expect(PhoneNumber::normalize($input))->toBeNull()
        ->and(PhoneNumber::isValid($input))->toBeFalse();
})->with([
    null,
    '',
    '0171194911',      // too short
    '017119491100',    // too long
    '01211949110',     // operator prefix 012 does not exist
    '+44 7700 900123', // not Bangladeshi
    'abc',
]);

it('formats numbers for display', function () {
    expect(PhoneNumber::display('+8801711949110'))->toBe('01711-949110');
});
