.PHONY: rpm deb

all: rpm deb

rpm_node8:
	docker run --rm -v `pwd`/server:/root/rpmbuild/server \
			-v `pwd`/analytics:/root/rpmbuild/analytics \
			-v `pwd`/build/rpmbuild:/root/rpmbuild/rpm \
			-v `pwd`/dist/RPMS_8:/root/rpmbuild/RPMS \
			-e "NODE_MIN_VERSION=8.0.0" \
			-e "NODE_MAX_VERSION=11" \
			amper43/hastic-rpmbuilder rpmbuild -bi rpm/hastic-server.spec

rpm_node6:
	docker run --rm -v `pwd`/server:/root/rpmbuild/server \
			-v `pwd`/analytics:/root/rpmbuild/analytics \
			-v `pwd`/build/rpmbuild:/root/rpmbuild/rpm \
			-v `pwd`/dist/RPMS_6:/root/rpmbuild/RPMS \
			-e "NODE_MIN_VERSION=6.14.0" \
			-e "NODE_MAX_VERSION=7" \
			amper43/hastic-rpmbuilder rpmbuild -ba rpm/hastic-server.spec

rpm: rpm_node8 rpm_node6
