package com.waypoint.dispatch;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waypoint.dispatch.identity.application.AccountAdminUseCase;
import com.waypoint.dispatch.platform.db.Database;
import com.waypoint.dispatch.platform.db.Migrator;
import com.waypoint.dispatch.platform.db.ModuleRole;
import com.waypoint.dispatch.platform.messaging.Command;
import com.waypoint.dispatch.platform.messaging.CommandBus;
import com.waypoint.dispatch.referencedata.application.ImportReferenceDataHandler;
import com.waypoint.dispatch.referencedata.contract.ReferenceQuery;
import com.waypoint.dispatch.shared.domain.Actor;
import com.waypoint.dispatch.shared.error.DomainException;
import com.waypoint.dispatch.shared.error.ErrorCode;
import com.waypoint.dispatch.support.TestDatabase;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@ExtendWith(TestDatabase.class)
class ReferenceCreationIntegrationTest {
  @Autowired Migrator migrator;
  @Autowired AccountAdminUseCase accounts;
  @Autowired CommandBus bus;
  @Autowired ObjectMapper mapper;
  @Autowired ImportReferenceDataHandler importer;
  @Autowired ReferenceQuery reference;
  @Autowired Database db;

  @DynamicPropertySource
  static void databaseUrl(DynamicPropertyRegistry registry) {
    registry.add("app.database-url", TestDatabase::url);
  }

  @Test
  void adminAdditionsSurviveImportAndDuplicateCodesAreRejected() throws Exception {
    migrator.migrate();
    importer.importFrom(Path.of("../data"), null);
    String email = "reference-create-" + UUID.randomUUID() + "@waypoint.test";
    UUID adminId = accounts.createAccount(email, "Reference Admin", "IntegrationTest2026!", "admin");
    accounts.grantDepot(email, "Peliyagoda");
    Actor admin = new Actor(adminId, null);
    String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    String depot = "NEW" + suffix;
    String vehicle = "VEH" + suffix;
    String outlet = "OUT" + suffix;
    UUID before = reference.currentVersionId().orElseThrow();

    command(admin, "reference:CreateDepot", "{\"code\":\"" + depot
        + "\",\"name\":\"New depot\",\"timezone\":\"Asia/Colombo\","
        + "\"latitude\":\"6.0535\",\"longitude\":\"80.2210\","
        + "\"locationPrecision\":\"approximate\"}");
    assertTrue(reference.depot(depot, null).isPresent());
    assertTrue(reference.depot(depot, before).isEmpty());

    command(admin, "reference:CreateVehicle", "{\"vehicleId\":\"" + vehicle
        + "\",\"depotCode\":\"Peliyagoda\",\"type\":\"van\","
        + "\"temperature\":\"reefer\",\"weightCapKg\":\"1200\","
        + "\"volumeCapM3\":\"8.5\",\"fuelType\":\"diesel\","
        + "\"kmPerL\":\"11.2\",\"weeklyFuelQuotaL\":\"280\"}");
    assertTrue(reference.vehicle(vehicle, null).isPresent());

    command(admin, "reference:CreateOutlet", "{\"outletId\":\"" + outlet
        + "\",\"brand\":\"Fresh\",\"district\":\"Colombo\","
        + "\"depotCode\":\"Peliyagoda\",\"dockType\":\"rear_dock\","
        + "\"parking\":\"normal\",\"windowOpen\":\"05:00\","
        + "\"windowClose\":\"08:00\"}");
    assertTrue(reference.outlet(outlet, null).isPresent());

    importer.importFrom(Path.of("../data"), null);
    assertTrue(reference.depot(depot, null).isPresent());
    assertTrue(reference.vehicle(vehicle, null).isPresent());
    assertTrue(reference.outlet(outlet, null).isPresent());
    DomainException duplicate = assertThrows(DomainException.class,
        () -> command(admin, "reference:CreateDepot", "{\"code\":\"" + depot
            + "\",\"name\":\"Again\",\"latitude\":\"6.0535\","
            + "\"longitude\":\"80.2210\",\"locationPrecision\":\"approximate\"}"));
    assertEquals(ErrorCode.CONFLICT, duplicate.code());
  }

  /**
   * REF-08: a holiday declared past the supplied calendar is a normal override, and
   * must neither refuse later additions as a gap in the calendar nor be written into
   * the supplied calendar by them.
   */
  @Test
  void anOverridePastTheSuppliedCalendarDoesNotBlockAdditions() throws Exception {
    migrator.migrate();
    importer.importFrom(Path.of("../data"), null);
    String email = "reference-override-" + UUID.randomUUID() + "@waypoint.test";
    UUID adminId = accounts.createAccount(email, "Reference Admin", "IntegrationTest2026!", "admin");
    accounts.grantDepot(email, "Peliyagoda");
    Actor admin = new Actor(adminId, null);
    // A Wednesday years past the supplied calendar, distinct per run.
    LocalDate holiday = LocalDate.of(2140, 1, 6)
        .plusWeeks(ThreadLocalRandom.current().nextInt(0, 2000));
    command(admin, "calendar:Override", "{\"date\":\"" + holiday
        + "\",\"operating\":false,\"reason\":\"Holiday declared ahead\"}");
    assertFalse(reference.isOperating(holiday));

    String vehicle = "VEH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    command(admin, "reference:CreateVehicle", "{\"vehicleId\":\"" + vehicle
        + "\",\"depotCode\":\"Peliyagoda\",\"type\":\"van\","
        + "\"temperature\":\"reefer\",\"weightCapKg\":\"1200\","
        + "\"volumeCapM3\":\"8.5\",\"fuelType\":\"diesel\","
        + "\"kmPerL\":\"11.2\",\"weeklyFuelQuotaL\":\"280\"}");

    assertTrue(reference.vehicle(vehicle, null).isPresent());
    assertFalse(reference.isOperating(holiday), "the override still reaches every reader");
    assertNull(db.asSystem(ModuleRole.REF, () -> db.queryOne(
            "SELECT 1 FROM ref.calendar_days WHERE calendar_date = ?", java.sql.Date.valueOf(holiday))),
        "an override is not written into the supplied calendar");
  }

  private void command(Actor actor, String kind, String payload) throws Exception {
    bus.dispatch(actor, new Command(UUID.randomUUID(), kind, null, mapper.readTree(payload), null));
  }
}
