<?php

use App\Services\Support\RegistrationNumber;

it('normalises registration numbers for duplicate checks', function (string $input) {
    expect(RegistrationNumber::normalize($input))->toBe('DHAKAMETROGA123456');
})->with([
    'Dhaka Metro Ga 12-3456',
    'dhaka metro ga 123456',
    ' DHAKA-METRO-GA-12-3456 ',
    'Dhaka Metro Ga 12.3456',
]);

it('keeps the display form readable', function () {
    expect(RegistrationNumber::clean('  Dhaka   Metro Ga  12-3456 '))->toBe('Dhaka Metro Ga 12-3456');
});
